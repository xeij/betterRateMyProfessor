import logging

import httpx

logger = logging.getLogger(__name__)

RMP_URL = "https://www.ratemyprofessors.com/graphql"
RMP_HEADERS = {
    "Authorization": "Basic dGVzdDp0ZXN0",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Referer": "https://www.ratemyprofessors.com/",
    "Origin": "https://www.ratemyprofessors.com",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
}

_SEARCH_SCHOOLS = """
query SearchSchools($text: String!) {
  newSearch {
    schools(query: { text: $text }) {
      edges { node { id name city state } }
    }
  }
}
"""

_SEARCH_PROFESSORS = """
query SearchTeachers($text: String!, $schoolID: ID!) {
  newSearch {
    teachers(query: { text: $text, schoolID: $schoolID }) {
      edges {
        node { id firstName lastName department avgRating numRatings wouldTakeAgain avgDifficulty }
      }
    }
  }
}
"""

_PROFESSOR_INFO = """
query GetProfessorInfo($id: ID!) {
  node(id: $id) {
    ... on Teacher { id firstName lastName department avgRating numRatings wouldTakeAgain avgDifficulty }
  }
}
"""

_RATINGS = """
query GetRatings($id: ID!, $count: Int!, $after: String) {
  node(id: $id) {
    ... on Teacher {
      ratings(first: $count, after: $after) {
        pageInfo { hasNextPage endCursor }
        edges { node { id comment qualityRating } }
      }
    }
  }
}
"""


async def _gql(query: str, variables: dict) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            RMP_URL,
            json={"query": query, "variables": variables},
            headers=RMP_HEADERS,
            timeout=15.0,
        )
        logger.warning("RMP status=%s body=%s", resp.status_code, resp.text[:500])
        resp.raise_for_status()
        return resp.json()


async def search_schools(q: str) -> list[dict]:
    data = await _gql(_SEARCH_SCHOOLS, {"text": q})
    edges = data["data"]["newSearch"]["schools"]["edges"]
    return [{"id": e["node"]["id"], "name": e["node"]["name"]} for e in edges]


async def search_professors(name: str, school_id: str) -> list[dict]:
    data = await _gql(_SEARCH_PROFESSORS, {"text": name, "schoolID": school_id})
    edges = data["data"]["newSearch"]["teachers"]["edges"]
    return [
        {
            "rmp_id": e["node"]["id"],
            "name": f"{e['node']['firstName']} {e['node']['lastName']}",
            "department": e["node"]["department"] or "",
            "rating": e["node"]["avgRating"] or 0.0,
            "num_ratings": e["node"].get("numRatings") or 0,
            "would_take_again": e["node"].get("wouldTakeAgain"),
            "difficulty": e["node"].get("avgDifficulty"),
        }
        for e in edges
    ]


async def fetch_professor_info(rmp_id: str) -> dict:
    data = await _gql(_PROFESSOR_INFO, {"id": rmp_id})
    return data["data"]["node"]


async def fetch_all_reviews(rmp_id: str) -> list[dict]:
    reviews = []
    after = None
    while True:
        data = await _gql(_RATINGS, {"id": rmp_id, "count": 20, "after": after})
        ratings = data["data"]["node"]["ratings"]
        reviews.extend([e["node"] for e in ratings["edges"]])
        if not ratings["pageInfo"]["hasNextPage"]:
            break
        after = ratings["pageInfo"]["endCursor"]
    return reviews

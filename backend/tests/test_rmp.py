import pytest
import respx
import httpx
from rmp import search_schools, search_professors, fetch_professor_info, fetch_all_reviews

RMP_URL = "https://www.ratemyprofessors.com/graphql"

SCHOOL_RESPONSE = {
    "data": {
        "search": {
            "schools": {
                "edges": [
                    {"node": {"id": "U2Nob29sLTEx", "name": "MIT", "city": "Cambridge", "state": "MA"}}
                ]
            }
        }
    }
}

PROFESSOR_SEARCH_RESPONSE = {
    "data": {
        "search": {
            "teachers": {
                "edges": [
                    {
                        "node": {
                            "id": "VGVhY2hlci0x",
                            "firstName": "Jane",
                            "lastName": "Smith",
                            "department": "Computer Science",
                            "avgRating": 4.2,
                            "numRatings": 10,
                        }
                    }
                ]
            }
        }
    }
}

PROFESSOR_INFO_RESPONSE = {
    "data": {
        "node": {
            "id": "VGVhY2hlci0x",
            "firstName": "Jane",
            "lastName": "Smith",
            "department": "Computer Science",
            "avgRating": 4.2,
            "numRatings": 2,
        }
    }
}

RATINGS_RESPONSE = {
    "data": {
        "node": {
            "ratings": {
                "pageInfo": {"hasNextPage": False, "endCursor": None},
                "edges": [
                    {"node": {"id": "1", "comment": "Great professor!", "qualityRating": 5.0}},
                    {"node": {"id": "2", "comment": "Hard but fair.", "qualityRating": 4.0}},
                ],
            }
        }
    }
}


@pytest.mark.asyncio
async def test_search_schools():
    with respx.mock:
        respx.post(RMP_URL).mock(return_value=httpx.Response(200, json=SCHOOL_RESPONSE))
        results = await search_schools("MIT")
    assert len(results) == 1
    assert results[0]["id"] == "U2Nob29sLTEx"
    assert results[0]["name"] == "MIT"


@pytest.mark.asyncio
async def test_search_professors():
    with respx.mock:
        respx.post(RMP_URL).mock(return_value=httpx.Response(200, json=PROFESSOR_SEARCH_RESPONSE))
        results = await search_professors("Jane Smith", "U2Nob29sLTEx")
    assert len(results) == 1
    assert results[0]["rmp_id"] == "VGVhY2hlci0x"
    assert results[0]["name"] == "Jane Smith"
    assert results[0]["department"] == "Computer Science"
    assert results[0]["rating"] == 4.2


@pytest.mark.asyncio
async def test_fetch_professor_info():
    with respx.mock:
        respx.post(RMP_URL).mock(return_value=httpx.Response(200, json=PROFESSOR_INFO_RESPONSE))
        info = await fetch_professor_info("VGVhY2hlci0x")
    assert info["firstName"] == "Jane"
    assert info["numRatings"] == 2


@pytest.mark.asyncio
async def test_fetch_all_reviews():
    with respx.mock:
        respx.post(RMP_URL).mock(return_value=httpx.Response(200, json=RATINGS_RESPONSE))
        reviews = await fetch_all_reviews("VGVhY2hlci0x")
    assert len(reviews) == 2
    assert reviews[0]["comment"] == "Great professor!"

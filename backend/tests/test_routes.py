import pytest
import respx
import httpx
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

SCHOOL_GQL_RESPONSE = {
    "data": {
        "search": {
            "schools": {
                "edges": [{"node": {"id": "U2Nob29sLTEx", "name": "MIT"}}]
            }
        }
    }
}

SEARCH_GQL_RESPONSE = {
    "data": {
        "search": {
            "teachers": {
                "edges": [
                    {
                        "node": {
                            "id": "VGVhY2hlci0x",
                            "firstName": "Jane",
                            "lastName": "Smith",
                            "department": "CS",
                            "avgRating": 4.2,
                            "numRatings": 10,
                        }
                    }
                ]
            }
        }
    }
}


def test_universities_endpoint():
    with respx.mock:
        respx.post("https://www.ratemyprofessors.com/graphql").mock(
            return_value=httpx.Response(200, json=SCHOOL_GQL_RESPONSE)
        )
        response = client.get("/universities?q=MIT")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "MIT"
    assert data[0]["id"] == "U2Nob29sLTEx"


def test_search_endpoint():
    with respx.mock:
        respx.post("https://www.ratemyprofessors.com/graphql").mock(
            return_value=httpx.Response(200, json=SEARCH_GQL_RESPONSE)
        )
        response = client.get("/search?name=Jane&university=U2Nob29sLTEx")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Jane Smith"
    assert data[0]["rmp_id"] == "VGVhY2hlci0x"

import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock, patch
from cache import get_cached_analysis


def _make_chain(return_data=None):
    execute_result = MagicMock()
    execute_result.data = return_data

    chain = MagicMock()
    chain.execute.return_value = execute_result
    chain.single.return_value = chain
    chain.eq.return_value = chain
    chain.select.return_value = chain
    chain.upsert.return_value = chain
    chain.insert.return_value = chain
    chain.delete.return_value = chain

    mock_client = MagicMock()
    mock_client.table.return_value = chain
    return mock_client


def _fresh_prof(review_count=10):
    return {
        "id": "abc-123",
        "rmp_id": "VGVhY2hlci0x",
        "name": "Jane Smith",
        "university": "U2Nob29sLTEx",
        "department": "CS",
        "overall_rating": 4.2,
        "total_review_count": review_count,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "analysis_results": [
            {"axis": "workload", "sentiment_score": 0.2, "positive_pct": 60.0,
             "negative_pct": 20.0, "neutral_pct": 20.0, "review_count": 5, "top_phrases": ["heavy assignments"]},
            {"axis": "clarity", "sentiment_score": 0.5, "positive_pct": 70.0,
             "negative_pct": 10.0, "neutral_pct": 20.0, "review_count": 3, "top_phrases": ["explains well"]},
            {"axis": "fairness", "sentiment_score": 0.0, "positive_pct": 40.0,
             "negative_pct": 40.0, "neutral_pct": 20.0, "review_count": 2, "top_phrases": ["fair grader"]},
        ],
    }


def test_cache_miss_returns_none():
    mock_client = _make_chain(return_data=None)
    with patch("cache.get_client", return_value=mock_client):
        result = get_cached_analysis("VGVhY2hlci0x", 10)
    assert result is None


def test_cache_hit_returns_structured_data():
    mock_client = _make_chain(return_data=_fresh_prof(review_count=10))
    with patch("cache.get_client", return_value=mock_client):
        result = get_cached_analysis("VGVhY2hlci0x", 10)
    assert result is not None
    assert result["name"] == "Jane Smith"
    assert set(result["axes"].keys()) == {"workload", "clarity", "fairness"}
    assert result["axes"]["workload"]["score"] == 0.2


def test_stale_cache_returns_none():
    prof = _fresh_prof()
    prof["analyzed_at"] = (datetime.now(timezone.utc) - timedelta(days=31)).isoformat()
    mock_client = _make_chain(return_data=prof)
    with patch("cache.get_client", return_value=mock_client):
        result = get_cached_analysis("VGVhY2hlci0x", 10)
    assert result is None


def test_new_reviews_invalidates_cache():
    mock_client = _make_chain(return_data=_fresh_prof(review_count=5))
    with patch("cache.get_client", return_value=mock_client):
        result = get_cached_analysis("VGVhY2hlci0x", current_review_count=20)
    assert result is None

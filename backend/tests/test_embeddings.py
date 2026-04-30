import numpy as np
import pytest
import respx
from httpx import Response

from embeddings import HF_API_URL, analyze_reviews

SAMPLE_REVIEWS = [
    "The homework is incredibly heavy and there are too many assignments every week.",
    "Very easy workload, barely any work required for this course.",
    "Explains concepts clearly and is very organized in lectures.",
    "Confusing lectures, really hard to follow what he is saying.",
    "Fair grader, always curves the exams when the class average is low.",
    "Harsh grader, docks points for the most minor mistakes.",
    "Great professor, highly recommend taking her class.",
    "Terrible teaching style, would avoid if you can.",
]

# seed phrases (5+5+5) + positive poles (3) + negative poles (3) = 21 reference texts
_N_REFS = 21
_DIM = 384


def _rand_embs(n: int) -> list[list[float]]:
    rng = np.random.default_rng(42)
    vecs = rng.standard_normal((n, _DIM)).astype(np.float32)
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    return (vecs / norms).tolist()


@pytest.fixture
def mock_hf():
    with respx.mock(assert_all_called=False) as mock:
        # First call = reviews (len varies), second = reference texts (_N_REFS)
        call_count = {"n": 0}

        def handler(request):
            import json
            texts = json.loads(request.content)["inputs"]
            call_count["n"] += 1
            return Response(200, json=_rand_embs(len(texts)))

        mock.post(HF_API_URL).mock(side_effect=handler)
        yield mock


@pytest.mark.asyncio
async def test_returns_all_three_axes(mock_hf, monkeypatch):
    monkeypatch.setenv("HF_TOKEN", "hf_test")
    result = await analyze_reviews(SAMPLE_REVIEWS)
    assert set(result.keys()) == {"workload", "clarity", "fairness"}


@pytest.mark.asyncio
async def test_each_axis_has_required_fields(mock_hf, monkeypatch):
    monkeypatch.setenv("HF_TOKEN", "hf_test")
    result = await analyze_reviews(SAMPLE_REVIEWS)
    required = {"score", "positive_pct", "negative_pct", "neutral_pct", "review_count", "top_phrases"}
    for axis_data in result.values():
        assert required.issubset(axis_data.keys())


@pytest.mark.asyncio
async def test_scores_in_range(mock_hf, monkeypatch):
    monkeypatch.setenv("HF_TOKEN", "hf_test")
    result = await analyze_reviews(SAMPLE_REVIEWS)
    for axis_data in result.values():
        assert -1.0 <= axis_data["score"] <= 1.0


@pytest.mark.asyncio
async def test_percentages_sum_to_100(mock_hf, monkeypatch):
    monkeypatch.setenv("HF_TOKEN", "hf_test")
    result = await analyze_reviews(SAMPLE_REVIEWS)
    for axis, axis_data in result.items():
        if axis_data["review_count"] > 0:
            total = axis_data["positive_pct"] + axis_data["negative_pct"] + axis_data["neutral_pct"]
            assert abs(total - 100.0) < 0.2, f"{axis}: {total}"


@pytest.mark.asyncio
async def test_empty_reviews(monkeypatch):
    monkeypatch.setenv("HF_TOKEN", "hf_test")
    result = await analyze_reviews([])
    for axis_data in result.values():
        assert axis_data["review_count"] == 0
        assert axis_data["score"] == 0.0


@pytest.mark.asyncio
async def test_top_phrases_are_strings(mock_hf, monkeypatch):
    monkeypatch.setenv("HF_TOKEN", "hf_test")
    result = await analyze_reviews(SAMPLE_REVIEWS)
    for axis_data in result.values():
        assert all(isinstance(p, str) for p in axis_data["top_phrases"])

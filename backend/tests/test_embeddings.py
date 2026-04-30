import pytest
from embeddings import analyze_reviews

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


def test_returns_all_three_axes():
    result = analyze_reviews(SAMPLE_REVIEWS)
    assert set(result.keys()) == {"workload", "clarity", "fairness"}


def test_each_axis_has_required_fields():
    result = analyze_reviews(SAMPLE_REVIEWS)
    required = {"score", "positive_pct", "negative_pct", "neutral_pct", "review_count", "top_phrases"}
    for axis_data in result.values():
        assert required.issubset(axis_data.keys())


def test_scores_in_range():
    result = analyze_reviews(SAMPLE_REVIEWS)
    for axis_data in result.values():
        assert -1.0 <= axis_data["score"] <= 1.0


def test_percentages_sum_to_100():
    result = analyze_reviews(SAMPLE_REVIEWS)
    for axis, axis_data in result.items():
        if axis_data["review_count"] > 0:
            total = axis_data["positive_pct"] + axis_data["negative_pct"] + axis_data["neutral_pct"]
            assert abs(total - 100.0) < 0.2, f"{axis}: {total}"


def test_empty_reviews():
    result = analyze_reviews([])
    for axis_data in result.values():
        assert axis_data["review_count"] == 0
        assert axis_data["score"] == 0.0


def test_top_phrases_are_strings():
    result = analyze_reviews(SAMPLE_REVIEWS)
    for axis_data in result.values():
        assert all(isinstance(p, str) for p in axis_data["top_phrases"])

from __future__ import annotations

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

MODEL_NAME = "all-MiniLM-L6-v2"

AXIS_SEEDS: dict[str, list[str]] = {
    "workload": [
        "heavy homework",
        "lots of assignments",
        "easy workload",
        "time-consuming",
        "too much work",
    ],
    "clarity": [
        "explains clearly",
        "confusing lectures",
        "hard to understand",
        "great teacher",
        "disorganized",
    ],
    "fairness": [
        "fair grader",
        "harsh grader",
        "curved the exam",
        "unfair",
        "biased grading",
    ],
}

POSITIVE_POLES = ["excellent", "highly recommend", "great experience"]
NEGATIVE_POLES = ["terrible", "avoid", "worst class ever"]
AXIS_THRESHOLD = 0.25

_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def analyze_reviews(reviews: list[str]) -> dict:
    axis_names = list(AXIS_SEEDS.keys())
    empty = {
        axis: {
            "score": 0.0,
            "positive_pct": 0.0,
            "negative_pct": 0.0,
            "neutral_pct": 0.0,
            "review_count": 0,
            "top_phrases": [],
        }
        for axis in axis_names
    }

    if not reviews:
        return empty

    model = get_model()

    seed_phrases = [p for phrases in AXIS_SEEDS.values() for p in phrases]
    all_texts = reviews + seed_phrases + POSITIVE_POLES + NEGATIVE_POLES
    all_embs = model.encode(all_texts, normalize_embeddings=True, batch_size=64)

    review_embs = all_embs[: len(reviews)]

    offset = len(reviews)
    axis_embs: dict[str, np.ndarray] = {}
    for axis, phrases in AXIS_SEEDS.items():
        n = len(phrases)
        axis_embs[axis] = np.mean(all_embs[offset : offset + n], axis=0, keepdims=True)
        offset += n

    pos_emb = np.mean(all_embs[offset : offset + len(POSITIVE_POLES)], axis=0, keepdims=True)
    neg_emb = np.mean(all_embs[offset + len(POSITIVE_POLES) :], axis=0, keepdims=True)

    axis_matrix = np.vstack([axis_embs[a] for a in axis_names])
    sims = cosine_similarity(review_embs, axis_matrix)
    best_idx = np.argmax(sims, axis=1)
    best_scores = sims[np.arange(len(reviews)), best_idx]

    classified: dict[str, list[tuple[int, str]]] = {a: [] for a in axis_names}
    for i, (review, ax_idx, score) in enumerate(zip(reviews, best_idx, best_scores)):
        if score >= AXIS_THRESHOLD:
            classified[axis_names[ax_idx]].append((i, review))

    results = {}
    for axis in axis_names:
        items = classified[axis]
        if not items:
            results[axis] = empty[axis]
            continue

        indices = [i for i, _ in items]
        texts = [t for _, t in items]
        embs = review_embs[indices]

        pos_sims = cosine_similarity(embs, pos_emb).flatten()
        neg_sims = cosine_similarity(embs, neg_emb).flatten()
        scores = np.clip(pos_sims - neg_sims, -1.0, 1.0)

        positive = int(np.sum(scores > 0.1))
        negative = int(np.sum(scores < -0.1))
        neutral = len(scores) - positive - negative
        total = len(scores)

        sorted_idx = np.argsort(scores)
        top_neg = [texts[i][:150] for i in sorted_idx[:3]]
        top_pos = [texts[i][:150] for i in sorted_idx[-3:][::-1]]
        top_phrases = top_pos + top_neg

        results[axis] = {
            "score": round(float(np.mean(scores)), 4),
            "positive_pct": round(100.0 * positive / total, 1),
            "negative_pct": round(100.0 * negative / total, 1),
            "neutral_pct": round(100.0 * neutral / total, 1),
            "review_count": total,
            "top_phrases": top_phrases,
        }

    return results

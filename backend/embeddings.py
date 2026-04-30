from __future__ import annotations

import asyncio
import os

import logging

import httpx
import numpy as np

logger = logging.getLogger(__name__)
from sklearn.metrics.pairwise import cosine_similarity

HF_EMBED_URL = "https://api-inference.huggingface.co/v1/embeddings"
HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

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


def _normalize(vecs: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)
    return vecs / norms


async def _embed(client: httpx.AsyncClient, texts: list[str]) -> np.ndarray:
    token = os.environ["HF_TOKEN"]
    resp = await client.post(
        HF_EMBED_URL,
        headers={"Authorization": f"Bearer {token}"},
        json={"model": HF_MODEL, "input": texts},
        timeout=60.0,
    )
    logger.warning("HF status=%s body=%s", resp.status_code, resp.text[:300])
    resp.raise_for_status()
    data = resp.json()
    vecs = [item["embedding"] for item in sorted(data["data"], key=lambda x: x["index"])]
    return _normalize(np.array(vecs, dtype=np.float32))


async def analyze_reviews(reviews: list[str]) -> dict:
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

    seed_phrases = [p for phrases in AXIS_SEEDS.values() for p in phrases]
    reference_texts = seed_phrases + POSITIVE_POLES + NEGATIVE_POLES

    async with httpx.AsyncClient() as client:
        review_embs, ref_embs = await asyncio.gather(
            _embed(client, reviews),
            _embed(client, reference_texts),
        )

    offset = 0
    axis_embs: dict[str, np.ndarray] = {}
    for axis, phrases in AXIS_SEEDS.items():
        n = len(phrases)
        axis_embs[axis] = np.mean(ref_embs[offset : offset + n], axis=0, keepdims=True)
        offset += n

    pos_emb = np.mean(ref_embs[offset : offset + len(POSITIVE_POLES)], axis=0, keepdims=True)
    neg_emb = np.mean(ref_embs[offset + len(POSITIVE_POLES) :], axis=0, keepdims=True)

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

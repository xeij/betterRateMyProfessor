import os
from datetime import datetime, timezone, timedelta

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

CACHE_TTL_DAYS = 30


def get_client() -> Client:
    return create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])


def get_cached_analysis(rmp_id: str, current_review_count: int) -> dict | None:
    try:
        client = get_client()
        result = (
            client.table("professors")
            .select("*, analysis_results(*)")
            .eq("rmp_id", rmp_id)
            .single()
            .execute()
        )
        prof = result.data
    except Exception:
        return None

    if not prof:
        return None

    analyzed_at = datetime.fromisoformat(prof["analyzed_at"]).replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) - analyzed_at > timedelta(days=CACHE_TTL_DAYS):
        return None

    if current_review_count > (prof.get("total_review_count") or 0):
        return None

    axes = {
        r["axis"]: {
            "score": r["sentiment_score"],
            "positive_pct": r["positive_pct"],
            "negative_pct": r["negative_pct"],
            "neutral_pct": r["neutral_pct"],
            "review_count": r["review_count"],
            "top_phrases": r["top_phrases"],
        }
        for r in prof["analysis_results"]
    }

    return {
        "name": prof["name"],
        "department": prof["department"],
        "overall_rating": prof.get("overall_rating") or 0.0,
        "review_count": current_review_count,
        "axes": axes,
    }


def write_analysis(rmp_id: str, prof_info: dict, axes_data: dict) -> None:
    try:
        client = get_client()

        prof_row = {
            "rmp_id": rmp_id,
            "name": f"{prof_info['firstName']} {prof_info['lastName']}",
            "university": "",
            "department": prof_info.get("department") or "",
            "overall_rating": prof_info.get("avgRating"),
            "total_review_count": prof_info.get("numRatings"),
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
        }

        upsert_result = (
            client.table("professors").upsert(prof_row, on_conflict="rmp_id").execute()
        )
        professor_id = upsert_result.data[0]["id"]

        client.table("analysis_results").delete().eq("professor_id", professor_id).execute()

        rows = [
            {
                "professor_id": professor_id,
                "axis": axis,
                "sentiment_score": data["score"],
                "positive_pct": data["positive_pct"],
                "negative_pct": data["negative_pct"],
                "neutral_pct": data["neutral_pct"],
                "review_count": data["review_count"],
                "top_phrases": data["top_phrases"],
            }
            for axis, data in axes_data.items()
        ]
        client.table("analysis_results").insert(rows).execute()
    except Exception:
        pass

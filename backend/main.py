import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from cache import get_cached_analysis, write_analysis
from embeddings import analyze_reviews
from models import AxisResult, ProfessorAnalysis, ProfessorSearchResult, SchoolResult
from rmp import fetch_all_reviews, fetch_professor_info, search_professors, search_schools

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/universities", response_model=list[SchoolResult])
async def universities(q: str):
    results = await search_schools(q)
    return [SchoolResult(**r) for r in results]


@app.get("/search", response_model=list[ProfessorSearchResult])
async def search(name: str, university: str):
    results = await search_professors(name, university)
    return [ProfessorSearchResult(**r) for r in results]


@app.get("/professor/{rmp_id}", response_model=ProfessorAnalysis)
async def professor(rmp_id: str):
    try:
        prof_info = await fetch_professor_info(rmp_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Professor not found")

    num_ratings = prof_info.get("numRatings") or 0
    cached = get_cached_analysis(rmp_id, num_ratings)
    if cached:
        cached["overall_rating"] = prof_info.get("avgRating") or 0.0
        cached["would_take_again"] = prof_info.get("wouldTakeAgain")
        cached["difficulty"] = prof_info.get("avgDifficulty")
        return ProfessorAnalysis(**cached)

    reviews = await fetch_all_reviews(rmp_id)
    comments = [r["comment"] for r in reviews if r.get("comment", "").strip()]
    axes_data = await analyze_reviews(comments)

    write_analysis(rmp_id, prof_info, axes_data)

    return ProfessorAnalysis(
        name=f"{prof_info['firstName']} {prof_info['lastName']}",
        department=prof_info.get("department") or "",
        overall_rating=prof_info.get("avgRating") or 0.0,
        review_count=num_ratings,
        would_take_again=prof_info.get("wouldTakeAgain"),
        difficulty=prof_info.get("avgDifficulty"),
        axes={k: AxisResult(**v) for k, v in axes_data.items()},
    )


handler = Mangum(app, lifespan="off", api_gateway_base_path="/default/better-rmp-backend")

import asyncio
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from models import ProfessorAnalysis, ProfessorSearchResult, ReviewItem, SchoolResult
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
        prof_info, reviews = await asyncio.gather(
            fetch_professor_info(rmp_id),
            fetch_all_reviews(rmp_id),
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Professor not found")
    review_items = [
        ReviewItem(comment=r["comment"], quality_rating=r.get("qualityRating") or 3)
        for r in reviews
        if r.get("comment", "").strip()
    ]

    return ProfessorAnalysis(
        name=f"{prof_info['firstName']} {prof_info['lastName']}",
        department=prof_info.get("department") or "",
        overall_rating=prof_info.get("avgRating") or 0.0,
        review_count=prof_info.get("numRatings") or 0,
        would_take_again=prof_info.get("wouldTakeAgainPercent"),
        difficulty=prof_info.get("avgDifficulty"),
        reviews=review_items,
    )


handler = Mangum(app, lifespan="off", api_gateway_base_path="/default/better-rmp-backend")

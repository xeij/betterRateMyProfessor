from pydantic import BaseModel


class SchoolResult(BaseModel):
    id: str
    name: str


class ProfessorSearchResult(BaseModel):
    rmp_id: str
    name: str
    department: str
    rating: float
    num_ratings: int = 0
    would_take_again: float | None = None
    difficulty: float | None = None


class AxisResult(BaseModel):
    score: float
    positive_pct: float
    negative_pct: float
    neutral_pct: float
    review_count: int
    top_phrases: list[str]


class ProfessorAnalysis(BaseModel):
    name: str
    department: str
    overall_rating: float
    review_count: int
    would_take_again: float | None = None
    difficulty: float | None = None
    axes: dict[str, AxisResult]

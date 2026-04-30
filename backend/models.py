from pydantic import BaseModel


class SchoolResult(BaseModel):
    id: str
    name: str


class ProfessorSearchResult(BaseModel):
    rmp_id: str
    name: str
    department: str
    rating: float


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
    axes: dict[str, AxisResult]

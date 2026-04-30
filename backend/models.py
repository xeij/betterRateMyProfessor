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


class ReviewItem(BaseModel):
    comment: str
    quality_rating: int


class ProfessorAnalysis(BaseModel):
    name: str
    department: str
    overall_rating: float
    review_count: int
    would_take_again: float | None = None
    difficulty: float | None = None
    reviews: list[ReviewItem]

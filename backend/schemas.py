from pydantic import BaseModel
from models import AgeGroup, Category, Gender
from typing import Optional

# ----------------------------
# models for API requests
# ----------------------------
class ArcherCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    club: str
    competition: str
    category: Category
    gender: Gender
    age_group: AgeGroup
    score20: Optional[int] = None
    score18: Optional[int] = None
    score16: Optional[int] = None
    score14: Optional[int] = None
    score12: Optional[int] = None
    score10: Optional[int] = None
    score8:  Optional[int] = None
    score6:  Optional[int] = None
    score4:  Optional[int] = None
    score0:  Optional[int] = None

class ArcherScoreUpdate(BaseModel):
    first_name: str
    last_name: str
    club: str
    category: Optional[Category] = None
    age_group: Optional[AgeGroup] = None
    gender: Optional[Gender] = None
    score20: Optional[int] = None
    score18: Optional[int] = None
    score16: Optional[int] = None
    score14: Optional[int] = None
    score12: Optional[int] = None
    score10: Optional[int] = None
    score8:  Optional[int] = None
    score6:  Optional[int] = None
    score4:  Optional[int] = None
    score0:  Optional[int] = None

class ArcherOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    club: str
    competition_id: int
    category: Category
    gender: Gender
    age_group: AgeGroup
    
    score20: Optional[int] = None
    score18: Optional[int] = None
    score16: Optional[int] = None
    score14: Optional[int] = None
    score12: Optional[int] = None
    score10: Optional[int] = None
    score8:  Optional[int] = None
    score6:  Optional[int] = None
    score4:  Optional[int] = None
    score0:  Optional[int] = None

    model_config = {
        "from_attributes": True     # tells Pydantic it can read from SQLAlchemy objects
    }

class CompetitionCreate(BaseModel):
    name: str
    date: str
    location: str
    logo_url: Optional[str] = None

class CompetitionOut(BaseModel):
    id: int
    name: str
    date: str
    location: str
    logo_url: Optional[str] = None

    model_config = {
        "from_attributes": True     # tells Pydantic it can read from SQLAlchemy objects
    }
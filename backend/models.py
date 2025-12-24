from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import declarative_base, relationship
from enum import Enum

Base = declarative_base()

class Language(Enum):
    EN = 'en'
    SL = 'sl'


class Category(Enum):
    BAREBOW = 'barebow'
    LONG_BOW = 'long bow'
    TRADITIONAL_BOW = 'traditional bow'
    PRIMITIVE_BOW = 'primitive bow'
    GUEST = 'guest'


class Gender(Enum):
    MALE = 'male'
    FEMALE = 'female'
    MIXED = 'mixed'


class AgeGroup(Enum):
    U10 = 'U10'
    U15 = 'U15'
    ADULTS = 'adults'


class Archer(Base):
    __tablename__ = "archers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    club = Column(String, nullable=True)
    
    score20 = Column(Integer, nullable=True)
    score18 = Column(Integer, nullable=True)
    score16 = Column(Integer, nullable=True)
    score14 = Column(Integer, nullable=True)
    score12 = Column(Integer, nullable=True)
    score10 = Column(Integer, nullable=True)
    score8  = Column(Integer, nullable=True)
    score6  = Column(Integer, nullable=True)
    score4  = Column(Integer, nullable=True)
    score0  = Column(Integer, nullable=True)

    category = Column(SQLEnum(Category), nullable=False)
    gender = Column(SQLEnum(Gender), nullable=False)
    age_group = Column(SQLEnum(AgeGroup), nullable=False)

    # competition = Column(String, nullable=False)
    competition_id = Column(Integer, ForeignKey("competitions.id"))     # foreign key to Competition
    competition = relationship("Competition", back_populates="archers") # declare relationship to Competition

class Competition(Base):
    __tablename__ = "competitions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    date = Column(String, nullable=False)
    location = Column(String, nullable=False)
    logo_url = Column(String, nullable=True)

    # one-to-many relationship to Archer
    archers = relationship("Archer", back_populates="competition", cascade="all, delete-orphan")
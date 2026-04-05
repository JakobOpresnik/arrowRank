from csv import DictReader
import os
import sys
import traceback
import uvicorn

# Force UTF-8 on stdout/stderr so print() doesn't crash on Slovenian/Croatian
# characters (č, š, ž, …) when running as a PyInstaller exe on Windows,
# where the default codepage is cp1252.
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace') # type: ignore
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace') # type: ignore

from fastapi import FastAPI, HTTPException, Depends, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy import desc, asc, func, text
from sqlalchemy.orm import Session
from typing import Optional, List, Dict

from models import AgeGroup, Category, Gender, Base, Archer, Competition
from schemas import ArcherCreate, ArcherOut, ArcherScoreUpdate, CompetitionOut
from constants import DATABASE_URL, UPLOAD_DIR
from database import SessionLocal, engine
from middleware import setup_cors
from storage import save_uploaded_file, setup_storage
from parse import parse_category

# DATABASE_URL = "sqlite:///./database.db"

Base.metadata.create_all(bind=engine)

app = FastAPI()

# apply CORS middleware
setup_cors(app)

# file upload directory & static hosting
setup_storage(app)


@app.get("/logos/{filename}")
def get_logo(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Logo not found")
    return FileResponse(file_path, headers={"Access-Control-Allow-Origin": "*"})


@app.get("/logos/{filename}/base64")
def get_logo_base64(filename: str):
    import base64 as b64mod
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Logo not found")
    with open(file_path, "rb") as f:
        content = f.read()
    return {"data": b64mod.b64encode(content).decode()}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------------------------
# API endpoints
# ----------------------------

# ----------------------------
# Populate DB on startup
# ----------------------------
def migrate_age_groups() -> None:
    """Migrate archers table if it still has old U10/U15 age group CHECK constraint."""
    with engine.connect() as conn:
        result = conn.execute(text(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name='archers'"
        ))
        row = result.fetchone()
        if row is None:
            return  # table doesn't exist yet, no migration needed
        table_sql: str = row[0] or ""
        if "U10" not in table_sql and "U15" not in table_sql:
            return  # already up to date

        print("Migrating archers table: updating U10/U15 to U11/U16...")
        conn.execute(text("ALTER TABLE archers RENAME TO archers_migration_backup"))
        conn.commit()

    Base.metadata.tables["archers"].create(bind=engine)

    with engine.connect() as conn:
        conn.execute(text("""
            INSERT INTO archers (
                id, first_name, last_name, email, club,
                score20, score18, score16, score14, score12,
                score10, score8, score6, score4, score0,
                category, gender, age_group, competition_id
            )
            SELECT
                id, first_name, last_name, email, club,
                score20, score18, score16, score14, score12,
                score10, score8, score6, score4, score0,
                category, gender,
                CASE age_group
                    WHEN 'U10' THEN 'U11'
                    WHEN 'U15' THEN 'U16'
                    ELSE age_group
                END,
                competition_id
            FROM archers_migration_backup
        """))
        conn.execute(text("DROP TABLE archers_migration_backup"))
        conn.commit()
    print("Migration complete.")


def migrate_gender_enum() -> None:
    """Migrate archers table if gender CHECK constraint is missing 'mixed'."""
    with engine.connect() as conn:
        result = conn.execute(text(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name='archers'"
        ))
        row = result.fetchone()
        if row is None:
            return
        table_sql: str = row[0] or ""
        # No migration needed if 'mixed' is already present (or no CHECK constraint at all)
        if "mixed" in table_sql or "CHECK" not in table_sql:
            return

        print("Migrating archers table: updating gender CHECK constraint to include 'mixed'...")
        conn.execute(text("ALTER TABLE archers RENAME TO archers_gender_backup"))
        conn.commit()

    Base.metadata.tables["archers"].create(bind=engine)

    with engine.connect() as conn:
        conn.execute(text("""
            INSERT INTO archers (
                id, first_name, last_name, email, club,
                score20, score18, score16, score14, score12,
                score10, score8, score6, score4, score0,
                category, gender, age_group, competition_id
            )
            SELECT
                id, first_name, last_name, email, club,
                score20, score18, score16, score14, score12,
                score10, score8, score6, score4, score0,
                category, gender, age_group, competition_id
            FROM archers_gender_backup
        """))
        conn.execute(text("DROP TABLE archers_gender_backup"))
        conn.commit()
    print("Gender enum migration complete.")


@app.on_event("startup")
def startup_event() -> None:
    print("Using database:", DATABASE_URL)
    print("Creating tables if they do not yet exist...")
    Base.metadata.create_all(bind=engine)
    migrate_age_groups()    # migrate old U10/U15 age groups to U11/U16 if needed
    migrate_gender_enum()   # migrate old gender CHECK constraint to include 'mixed'


@app.get("/health")
def health():
    return {"status": "ok"}


# ----------------------------
# ARCHERS
# ----------------------------
@app.post("/archers/upload")
def upload_data_into_db(
    file: UploadFile = File(...),
    competition_id: int = Form(...),
    language: Optional[str] = Form(None),  # declared so FastAPI doesn't choke on it
    db: Session = Depends(get_db)
) -> None:
    try:
        # check if competition exists
        competition: Optional[Competition] = db.query(Competition).filter(Competition.id == competition_id).first()
        if competition is None:
            raise HTTPException(status_code=404, detail="Competition not found")

        # reset cursor — starlette may leave it at end after writing to SpooledTemporaryFile
        file.file.seek(0)

        # read uploaded CSV file; try encodings in order of likelihood
        raw: bytes = file.file.read()
        content_str: str = ''
        for encoding in ['utf-8-sig', 'cp1250', 'latin-1']:
            try:
                content_str = raw.decode(encoding)
                break
            except (UnicodeDecodeError, ValueError):
                continue

        # fix double-encoded UTF-8: data was UTF-8 but got misread as cp1250
        # then re-saved as UTF-8, producing garbled chars (e.g. Š→Ĺ , č→ÄŤ)
        # reverse line-by-line so one bad char doesn't block the entire fix
        if not any(c in content_str for c in 'čšžČŠŽ'):
            fixed_lines = []
            for line in content_str.splitlines():
                try:
                    fixed_lines.append(line.encode('cp1250').decode('utf-8'))
                except (UnicodeDecodeError, UnicodeEncodeError):
                    fixed_lines.append(line)
            candidate = '\n'.join(fixed_lines)
            if any(c in candidate for c in 'čšžČŠŽ'):
                content_str = candidate

        content: List[str] = content_str.splitlines()
        delimiter = ';' if content and ';' in content[0] else ','
        reader: DictReader[str] = DictReader(content, delimiter=delimiter)

        print("processing CSV rows...")

        for row in reader:
            email: str = row.get("Email", "")
            club: str = row.get("klub", "")

            full_name: str = row.get("ime in priimek", "")
            if " " in full_name:
                first_name, last_name = full_name.split(' ', 1)
            else:
                first_name, last_name = full_name, ""

            print("full name: ", full_name)

            full_category: str = row.get("slog", "")
            category, gender, age_group = parse_category(full_category)

            print(f"Parsed archer: {first_name} {last_name}, email: {email}, club: {club}, category: {category}, gender: {gender}, age group: {age_group}")

            # avoid duplicates within the same competition
            exists: Optional[Archer] = db.query(Archer).filter(
                Archer.first_name == first_name,
                Archer.last_name == last_name,
                Archer.competition_id == competition_id
            ).first()

            if exists is None:
                archer = Archer(
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    club=club,
                    competition_id=competition_id,
                    category=category,
                    gender=gender,
                    age_group=age_group,
                    score20=None,
                    score18=None,
                    score16=None,
                    score14=None,
                    score12=None,
                    score10=None,
                    score8=None,
                    score6=None,
                    score4=None,
                    score0=None,
                )
                db.add(archer)

        db.commit()
        print("Archers loaded from CSV into DB")

    except HTTPException:
        raise
    except Exception as e:
        tb: str = traceback.format_exc()
        print(f"ERROR in /archers/upload:\n{tb}")
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}\n\n{tb}")


@app.post("/archers/score", response_model=ArcherOut)
def update_archer_score(
    update: ArcherScoreUpdate,
    db: Session = Depends(get_db)
) -> ArcherOut:
    # find correct archer by id
    archer: Optional[Archer] = db.query(Archer).filter(
        Archer.id == update.id
    ).first()

    if not archer:
        raise HTTPException(status_code=404, detail="Archer not found")
    
    print("archer found:", archer.first_name, archer.last_name)
    print("updating scores:", update)

    archer.club = update.club           # type: ignore
    archer.category = update.category   # type: ignore
    archer.age_group = update.age_group # type: ignore
    archer.gender = update.gender       # type: ignore

    archer.score20 = update.score20 # type: ignore
    archer.score18 = update.score18 # type: ignore
    archer.score16 = update.score16 # type: ignore
    archer.score14 = update.score14 # type: ignore
    archer.score12 = update.score12 # type: ignore
    archer.score10 = update.score10 # type: ignore
    archer.score8 = update.score8 # type: ignore
    archer.score6 = update.score6 # type: ignore
    archer.score4 = update.score4 # type: ignore
    archer.score0 = update.score0 # type: ignore

    db.commit()
    db.refresh(archer)

    return archer


@app.delete("/archers/competition/{competition_id}")
def delete_all_archers(
    competition_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    archers: List[Archer] = db.query(Archer).filter(Archer.competition_id == competition_id).all()
    count = len(archers)
    for archer in archers:
        db.delete(archer)
    db.commit()
    return {"message": f"Deleted {count} archers"}


@app.delete("/archers/{archer_id}", response_model=ArcherOut)
def delete_archer(
    archer_id: int, 
    db: Session = Depends(get_db)
) -> ArcherOut:
    archer: Optional[Archer] = db.query(Archer).filter(Archer.id == archer_id).first()
    
    if not archer:
        raise HTTPException(status_code=404, detail="Archer not found")

    db.delete(archer)
    db.commit()
    return archer


@app.post("/archers/clear_score/{archer_id}", response_model=ArcherOut)
def clear_archer_score(
    archer_id: int,
    db: Session = Depends(get_db)
) -> ArcherOut:
    archer: Optional[Archer] = db.query(Archer).filter(Archer.id == archer_id).first()

    if not archer:
        raise HTTPException(status_code=404, detail="Archer not found")
    
    archer.score20 = None # type: ignore
    archer.score18 = None # type: ignore
    archer.score16 = None # type: ignore
    archer.score14 = None # type: ignore
    archer.score12 = None # type: ignore
    archer.score10 = None # type: ignore
    archer.score8 = None # type: ignore
    archer.score6 = None # type: ignore
    archer.score4 = None # type: ignore
    archer.score0 = None # type: ignore

    db.commit()
    db.refresh(archer)
    return archer


@app.post("/archers/clear_scores/{competition_id}")
def clear_all_archer_scores(
    competition_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    try:
        comp_id = int(competition_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="competition_id must be an integer")
    
    archers: List[Archer] = db.query(Archer).filter(Archer.competition_id == comp_id).all()

    if not archers:
        raise HTTPException(status_code=404, detail="No archers found")
    
    for archer in archers:
        archer.score20 = None # type: ignore
        archer.score18 = None # type: ignore
        archer.score16 = None # type: ignore
        archer.score14 = None # type: ignore
        archer.score12 = None # type: ignore
        archer.score10 = None # type: ignore
        archer.score8 = None # type: ignore
        archer.score6 = None # type: ignore
        archer.score4 = None # type: ignore
        archer.score0 = None # type: ignore

    db.commit()
    db.close()
    return {"message": f"Cleared scores for {len(archers)} archers"}


@app.get("/archer/{competition_id}/{archer_id}", response_model=ArcherOut)
def get_archer(
    competition_id: str,
    archer_id: str,
    db: Session = Depends(get_db)
) -> Archer:
    try:
        comp_id = int(competition_id)
        arch_id = int(archer_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="competition_id and archer_id must be integers")

    archer = db.query(Archer).filter(
        Archer.competition_id == comp_id,
        Archer.id == arch_id
    ).first()

    if not archer:
        raise HTTPException(status_code=404, detail="Archer not found")

    return archer


@app.get("/archers/{competition_id}", response_model=List[ArcherOut])
def get_archers(
    competition_id: str, 
    db: Session = Depends(get_db)
) -> List[Archer]:
    try:
        comp_id = int(competition_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="competition_id must be an integer")
    
    return db.query(Archer).filter(Archer.competition_id == comp_id).all()


@app.get("/archers/filter/{competition_id}", response_model=List[ArcherOut])
def get_archers_filtered(
    competition_id: str,
    club: Optional[str] = Query(None),              # optional query parameter
    bow_category: Optional[Category] = Query(None), # optional query parameter
    gender: Optional[Gender] = Query(None),         # optional query parameter
    age_group: Optional[AgeGroup] = Query(None),    # optional query parameter
    sort: Optional[str] = Query(None, pattern="^(asc|desc)$"),
    db: Session = Depends(get_db)
) -> List[Archer]:
    try:
        comp_id = int(competition_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="competition_id must be an integer")
    
    query: SAQuery[Archer] = db.query(Archer).filter(Archer.competition_id == comp_id) # type: ignore

    # apply optional filters
    if club is not None:
        query = query.filter(Archer.club == club)
    if bow_category is not None:
        query = query.filter(Archer.category == bow_category)
    if gender is not None:
        query = query.filter(Archer.gender == gender)
    if age_group is not None:
        query = query.filter(Archer.age_group == age_group)

    # sorting
    total_score_expr = (
        func.coalesce(Archer.score20, 0) * 20 +
        func.coalesce(Archer.score18, 0) * 18 +
        func.coalesce(Archer.score16, 0) * 16 +
        func.coalesce(Archer.score14, 0) * 14 +
        func.coalesce(Archer.score12, 0) * 12 +
        func.coalesce(Archer.score10, 0) * 10 +
        func.coalesce(Archer.score8, 0) * 8 +
        func.coalesce(Archer.score6, 0) * 6 +
        func.coalesce(Archer.score4, 0) * 4 +
        func.coalesce(Archer.score0, 0) * 0    # safe no-op, but keeps consistency
    ).label('total_score')

    if sort == "asc":
        query = query.order_by(asc(total_score_expr))
    elif sort == "desc":
        query = query.order_by(desc(total_score_expr))
    
    archers: List[Archer] = query.all()
    return archers


@app.post("/archers", response_model=ArcherOut)
def create_archer(
    archer_in: ArcherCreate, 
    db: Session = Depends(get_db)
) -> Archer:
    try:
        comp_id = int(archer_in.competition)
    except ValueError:
        raise HTTPException(status_code=400, detail="competition must be an integer")

    print("Creating archer:", archer_in)    

    new_archer = Archer(
        first_name=archer_in.first_name,
        last_name=archer_in.last_name,
        email=archer_in.email,
        club=archer_in.club,
        competition_id=comp_id,  # set foreign key
        category=archer_in.category,
        gender=archer_in.gender,
        age_group=archer_in.age_group,
        score20=None,
        score18=None,
        score16=None,
        score14=None,
        score12=None,
        score10=None,
        score8=None,
        score6=None,
        score4=None,
        score0=None,
    )

    db.add(new_archer)
    db.commit()
    db.refresh(new_archer)

    return new_archer


# ----------------------------
# LEADERBOARDS
# ----------------------------
@app.get("/leaderboards/category", response_model=Dict[str, List[ArcherOut]])
def get_category_leaderboards(db: Session = Depends(get_db)) -> Dict[str, List[ArcherOut]]:
    leaderboard = {}
    for category in Category:
        archers_in_category = (
            db.query(Archer)
            .filter(Archer.category == category, Archer.score != None)
            .order_by(desc(Archer.score))
            .all()
        )

        if not archers_in_category:
            raise HTTPException(
                status_code=400, 
                detail=f"No archers with scores found in category '{category.value}'"
            )

        leaderboard[category.value] = archers_in_category
    
    return leaderboard


@app.get("/leaderboards/age_group", response_model=Dict[str, List[ArcherOut]])
def get_age_group_leaderboards(db: Session = Depends(get_db)) -> Dict[str, List[ArcherOut]]:
    leaderboard = {}
    for age_group in AgeGroup:
        archers_in_age_group = (
            db.query(Archer)
            .filter(Archer.age_group == age_group, Archer.score != None)
            .order_by(desc(Archer.score))
            .all()
        )

        if not archers_in_age_group:
            raise HTTPException(
                status_code=400, 
                detail=f"No archers with scores found in age group '{age_group.value}'"
            )

        leaderboard[age_group.value] = archers_in_age_group
    
    return leaderboard


# ----------------------------
# COMPETITIONS
# ----------------------------
@app.post("/competitions", response_model=CompetitionOut)
def create_competition(
    name: str = Form(...),
    date: str = Form(...),
    location: str = Form(...),
    logo: UploadFile = File(None),  # optional logo file
    db: Session = Depends(get_db)
):
    logo_url: Optional[str] = save_uploaded_file(logo, name)

    new_competition = Competition(
        name=name,
        date=date,
        location=location,
        logo_url=logo_url
    )
    db.add(new_competition)
    db.commit()
    db.refresh(new_competition)
    return new_competition


@app.get("/competitions", response_model=List[CompetitionOut])
def get_competitions(db: Session = Depends(get_db)):
    return db.query(Competition).all()


@app.get("/competitions/{competition_id}", response_model=CompetitionOut)
def get_competition(competition_id: int, db: Session = Depends(get_db)):
    competition: Optional[Competition] = db.query(Competition).filter(Competition.id == competition_id).first()
    if competition is None:
        raise HTTPException(status_code=404, detail="Competition not found")
    return competition


@app.delete("/competitions/{competition_id}", response_model=CompetitionOut)
def delete_competition(competition_id: int, db: Session = Depends(get_db)):
    competition: Optional[Competition] = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    db.query(Archer).filter(Archer.competition_id == competition_id).delete()
    db.delete(competition)
    db.commit()
    return competition


@app.delete("/competitions")
def delete_all_competitions(db: Session = Depends(get_db)) -> Dict[str, int]:
    archer_count: int = db.query(Archer).count()
    competition_count: int = db.query(Competition).count()
    db.query(Archer).delete()
    db.query(Competition).delete()
    db.commit()
    return {"archer_count": archer_count, "competition_count": competition_count}


@app.post("/competitions/logo/{competition_id}", response_model=CompetitionOut)
def upload_competition_logo(
    competition_id: int, 
    logo: UploadFile = File(None), 
    db: Session = Depends(get_db)
):
    competition: Optional[Competition] = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    competition.logo_url = save_uploaded_file(logo, competition.name)  # type: ignore

    db.commit()
    db.refresh(competition)

    return competition


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    # run uvicorn programmatically (good for freezing)
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
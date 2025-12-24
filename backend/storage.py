import os
import re
import uuid
from typing import Optional
from fastapi import FastAPI, UploadFile
from fastapi.staticfiles import StaticFiles
from constants import UPLOAD_DIR

def setup_storage(app: FastAPI):
    # ensure upload logo directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    # mount static files folder
    app.mount("/logos", StaticFiles(directory=UPLOAD_DIR), name="logos")


def sanitize_string(name: str) -> str:
    # remove potential unsafe characters
    return re.sub(r'[^a-zA-Z0-9_\-\.]', '_', name)


def save_uploaded_file(
    file: Optional[UploadFile],
    competition_name: str,
) -> Optional[str]:
    """
    Saves an uploaded file and removes ALL existing files belonging
    to the same competition in UPLOAD_DIR.

    Returns None if no file is provided.
    """
    safe_competition_name: str = sanitize_string(competition_name)

    # remove all existing files for this competition
    for existing_file in os.listdir(UPLOAD_DIR):
        if existing_file.startswith(safe_competition_name + "_"):
            os.remove(os.path.join(UPLOAD_DIR, existing_file))

    # if no new file, return None (deletes logo)
    if not file:
        return None
    
    # create new filename
    ext: str = os.path.splitext(str(file.filename))[1]
    filename: str = f"{safe_competition_name}_{uuid.uuid4()}{ext}"
    filepath: str = os.path.join(UPLOAD_DIR, filename)

    # write file
    with open(filepath, "wb") as buffer:
        buffer.write(file.file.read())

    # return relative URL for frontend use
    return f"/logos/{filename}"

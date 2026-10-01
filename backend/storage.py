import os
import re
import uuid
from typing import Optional
from fastapi import FastAPI, UploadFile
from constants import UPLOAD_DIR

def setup_storage(app: FastAPI):
    # ensure upload logo directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def sanitize_string(name: str) -> str:
    # remove potential unsafe characters
    return re.sub(r'[^a-zA-Z0-9_\-\.]', '_', name)


def remove_logo_file(logo_url: Optional[str]) -> None:
    # only the file this competition references, so similarly named competitions keep theirs
    if not logo_url:
        return
    path: str = os.path.join(UPLOAD_DIR, os.path.basename(logo_url))
    if os.path.isfile(path):
        os.remove(path)


def save_uploaded_file(
    file: Optional[UploadFile],
    competition_name: str,
    old_logo_url: Optional[str] = None,
) -> Optional[str]:
    """
    Saves an uploaded file and removes the competition's previous logo file.

    Returns None if no file is provided.
    """
    safe_competition_name: str = sanitize_string(competition_name)
    remove_logo_file(old_logo_url)

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

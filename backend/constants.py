import os
from dotenv import load_dotenv

# load variables from .env
load_dotenv()

DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./default.db")
BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", 8000))
FE_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
FE_BUILD_URL: str = os.getenv("FRONTEND_BUILD_URL", "http://localhost:4173")

CSV_DATA_FILE_PATH: str = os.getenv("CSV_FILE", "data/mock_data.csv")

# BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
# UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploaded_logos")

# UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploaded_logos")
UPLOAD_DIR = "uploaded_logos"

# IS_PACKAGED = getattr(sys, "_MEIPASS", False)  # optional if using PyInstaller or exe

# if IS_PACKAGED:
#     # production: folder next to backend.exe
#     UPLOAD_DIR = os.path.join(BASE_DIR, "uploaded_logos")
# else:
#     # development: relative to project root
#     UPLOAD_DIR = os.path.join(BASE_DIR, "..", "uploaded_logos")
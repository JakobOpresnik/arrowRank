import os
from dotenv import load_dotenv

# load variables from .env
load_dotenv()

DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./default.db")
BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", 8000))
FE_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
FE_BUILD_URL: str = os.getenv("FRONTEND_BUILD_URL", "http://localhost:4173")

CSV_DATA_FILE_PATH: str = os.getenv("CSV_FILE", "data/mock_data.csv")

UPLOAD_DIR = "uploaded_logos"
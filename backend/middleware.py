from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from constants import FE_URL, FE_BUILD_URL

def setup_cors(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[FE_URL, FE_BUILD_URL],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
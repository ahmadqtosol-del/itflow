import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.api.routes.websocket import router as websocket_router
from app.core.config import get_settings
from app.db.session import Base, engine

logging.basicConfig(level=logging.INFO)
settings = get_settings()

# Dev/demo convenience: auto-create tables on boot. For production,
# manage schema changes with Alembic instead (see migrations/).
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "https://itflow-9p6.pages.dev",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)
app.include_router(websocket_router)  # exposed at /ws (no version prefix, matches frontend config.ws.url)


@app.get("/")
def root():
    return {"name": settings.app_name, "status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}

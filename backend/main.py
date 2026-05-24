from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api import questions, auth, papers

app = FastAPI(
    title="PrepBuddy API",
    description="Backend API for PrepBuddy MDCAT & NUMS Prep Platform",
    version="1.0.0"
)

# Register Routers
app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(papers.router)

from app.db.session import Base, engine
from app.models import engagement, user
Base.metadata.create_all(bind=engine)

# Mount uploads directory
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS - Restricted to allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        # Add your production frontend URL here later, e.g. "https://prepbuddy.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to PrepBuddy API", "status": "online"}

@app.get("/health")
async def health_check():
    """Health check endpoint to keep the server active and verify it is running."""
    return {"status": "ok", "message": "Server is active and healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


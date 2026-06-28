from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from contextlib import asynccontextmanager

from app.api import questions, auth, papers, ai_tutor

from app.db.session import Base, engine, SessionLocal
from app.models import engagement, user, ai_memory
from app.models.user import User as UserModel, UserRole
from app.core.security import get_password_hash

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed/Update Admin
    db = SessionLocal()
    try:
        admin_email = os.getenv("ADMIN_EMAIL")
        admin_pass = os.getenv("ADMIN_PASSWORD")
        admin_name = os.getenv("ADMIN_FULL_NAME", "Admin")
        
        if admin_email and admin_pass:
            # First, find any existing admin user (by role)
            existing_admin = db.query(UserModel).filter(UserModel.role == UserRole.ADMIN).first()
            
            if existing_admin:
                # Update existing admin with latest credentials
                existing_admin.email = admin_email
                existing_admin.hashed_password = get_password_hash(admin_pass)
                existing_admin.full_name = admin_name
                existing_admin.is_active = True
                existing_admin.is_blocked = False
                existing_admin.is_deleted = False
                db.commit()
                print("Successfully updated admin user")
            else:
                # Create new admin
                new_admin = UserModel(
                    email=admin_email,
                    username="admin",
                    hashed_password=get_password_hash(admin_pass),
                    full_name=admin_name,
                    role=UserRole.ADMIN,
                    is_active=True
                )
                db.add(new_admin)
                db.commit()
                print("Successfully seeded admin user")
    except Exception as e:
        print(f"Error seeding admin: {e}")
        db.rollback()
    finally:
        db.close()
    yield

app = FastAPI(
    title="PrepCat API",
    description="Backend API for PrepCat MDCAT & NUMS Prep Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Register Routers
app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(papers.router)
app.include_router(ai_tutor.router)

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
        "https://prepbuddy-tau.vercel.app",
        "https://prep-buddy-theta.vercel.app"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to PrepCat API", "status": "online"}

@app.get("/health")
async def health_check():
    """Health check endpoint to keep the server active and verify it is running."""
    return {"status": "ok", "message": "Server is active and healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


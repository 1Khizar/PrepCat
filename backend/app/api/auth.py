from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User as UserModel
from app.core.security import get_password_hash, verify_password, create_access_token
from pydantic import BaseModel, EmailStr, field_validator
import re
from jose import JWTError, jwt
from app.core.security import ALGORITHM, SECRET_KEY
from datetime import date, timedelta
from app.models.engagement import UserActivity, SavedPaper
from app.models.ai_memory import AIInteraction

router = APIRouter(prefix="/auth", tags=["Authentication"])

class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str
    phone_number: str = ""

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        return v

    @field_validator("password")
    @classmethod
    def password_valid(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        return v

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(UserModel).filter(UserModel.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    if user.is_blocked:
        raise HTTPException(status_code=403, detail="Account is blocked.")
    if user.is_deleted:
        raise HTTPException(status_code=403, detail="Account has been deleted.")
    return user

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(UserModel).filter(UserModel.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Ensure username is unique and clean
    base_username = re.sub(r'[^a-zA-Z0-9]', '', user_in.username)
    if not base_username:
        base_username = user_in.email.split('@')[0]
        base_username = re.sub(r'[^a-zA-Z0-9]', '', base_username)
    
    username = base_username
    counter = 1
    while db.query(UserModel).filter(UserModel.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1

    db_user = UserModel(
        email=user_in.email,
        username=username,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone_number=user_in.phone_number
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    access_token = create_access_token(subject=str(db_user.id))
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect credentials")
    
    if user.is_blocked:
        raise HTTPException(status_code=403, detail="Account is blocked. Please contact admin.")
    
    access_token = create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def read_users_me(current_user: UserModel = Depends(get_current_user)):
    return current_user

@router.get("/activity")
def get_user_activity(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    today = date.today()
    
    # Check if they have an activity log for today
    today_activity = db.query(UserActivity).filter(
        UserActivity.user_id == current_user.id,
        UserActivity.activity_date == today
    ).first()
    
    # Calculate streak (look backwards from today)
    streak = 0
    check_date = today
    
    # Get all distinct activity dates for the user
    activities = db.query(UserActivity.activity_date).filter(
        UserActivity.user_id == current_user.id
    ).all()
    
    dates_set = {act[0] for act in activities}
    
    while check_date in dates_set:
        streak += 1
        check_date = check_date - timedelta(days=1)
        
    return {
        "current_streak": streak,
        "active_dates": [str(d) for d in dates_set],
        "today_logged": today_activity is not None
    }


@router.post("/record-daily-activity")
def log_user_activity(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    """Log user activity for today to maintain streak"""
    today = date.today()
    
    # Check if they already have an activity log for today
    existing_activity = db.query(UserActivity).filter(
        UserActivity.user_id == current_user.id,
        UserActivity.activity_date == today
    ).first()
    
    if not existing_activity:
        new_activity = UserActivity(user_id=current_user.id, activity_date=today)
        db.add(new_activity)
        db.commit()
        db.refresh(new_activity)
    
    # Return updated activity data
    return get_user_activity(db, current_user)

@router.post("/record-paper-view")
def log_paper_opened(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    """Increment the user's paper opened count"""
    if current_user.papers_opened_count is None:
        current_user.papers_opened_count = 0
    current_user.papers_opened_count += 1
    db.commit()
    return {"message": "Paper opened count incremented", "count": current_user.papers_opened_count}

# Admin specific routes
def get_admin_user(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@router.get("/admin/users")
def get_all_users(db: Session = Depends(get_db), admin: UserModel = Depends(get_admin_user)):
    users = db.query(UserModel).filter(UserModel.is_deleted == False).order_by(UserModel.created_at.desc()).all()
    # Mask password for security
    for u in users:
        u.hashed_password = ""
    return users

@router.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: UserModel = Depends(get_admin_user)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Soft delete
    user.is_deleted = True
    db.commit()
    return {"message": "User deleted successfully"}

@router.patch("/admin/users/{user_id}/block")
def block_user(user_id: int, db: Session = Depends(get_db), admin: UserModel = Depends(get_admin_user)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_blocked = True
    db.commit()
    return {"message": "User blocked"}

@router.patch("/admin/users/{user_id}/unblock")
def unblock_user(user_id: int, db: Session = Depends(get_db), admin: UserModel = Depends(get_admin_user)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_blocked = False
    db.commit()
    return {"message": "User unblocked"}

@router.get("/admin/users/{user_id}/stats")
def get_user_stats(user_id: int, db: Session = Depends(get_db), admin: UserModel = Depends(get_admin_user)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    today = date.today()
    streak = 0
    check_date = today

    activities = db.query(UserActivity.activity_date).filter(
        UserActivity.user_id == user_id
    ).all()

    dates_set = {act[0] for act in activities}

    while check_date in dates_set:
        streak += 1
        check_date = check_date - timedelta(days=1)
    
    # Get AI tutor stats
    ai_interactions = db.query(AIInteraction).filter(AIInteraction.user_id == user_id).all()
    ai_questions_asked = len(ai_interactions)
    
    # Calculate number of unique days used (conversations)
    ai_dates_used = set()
    for interaction in ai_interactions:
        if interaction.created_at:
            ai_dates_used.add(interaction.created_at.date())
    ai_days_used = len(ai_dates_used)
    
    # Get last used date
    ai_last_used = None
    if ai_interactions:
        last_interaction = ai_interactions[-1]
        ai_last_used = last_interaction.created_at

    return {
        "created_at": user.created_at,
        "current_streak": streak,
        "papers_opened": user.papers_opened_count or 0,
        "saved_papers": db.query(SavedPaper).filter(SavedPaper.user_id == user_id).count(),
        "ai_questions_asked": ai_questions_asked,
        "ai_days_used": ai_days_used,
        "ai_last_used": ai_last_used
    }
    }


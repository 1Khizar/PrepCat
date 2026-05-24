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
from app.models.engagement import UserActivity

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
    return user

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(UserModel).filter(UserModel.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = UserModel(
        email=user_in.email,
        username=user_in.username,
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
    
    # Check if they already have an activity log for today
    today_activity = db.query(UserActivity).filter(
        UserActivity.user_id == current_user.id,
        UserActivity.activity_date == today
    ).first()
    
    # If not logged today, create it! (Daily streak tracking)
    if not today_activity:
        new_activity = UserActivity(user_id=current_user.id, activity_date=today)
        db.add(new_activity)
        db.commit()
    
    # Calculate streak (look backwards from today)
    streak = 0
    check_date = today
    
    # Get all distinct activity dates for the user ordered descending
    activities = db.query(UserActivity.activity_date).filter(
        UserActivity.user_id == current_user.id
    ).order_by(UserActivity.activity_date.desc()).all()
    
    dates_set = {act[0] for act in activities}
    
    while check_date in dates_set:
        streak += 1
        check_date = check_date - timedelta(days=1)
        
    return {
        "current_streak": streak,
        "active_dates": [str(d) for d in dates_set],
        "today_logged": True
    }

# Admin specific routes
def get_admin_user(current_user: UserModel = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@router.get("/admin/users")
def get_all_users(db: Session = Depends(get_db), admin: UserModel = Depends(get_admin_user)):
    users = db.query(UserModel).filter(UserModel.role == "student").all()
    # Mask password for security
    for u in users:
        u.hashed_password = ""
    return users

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


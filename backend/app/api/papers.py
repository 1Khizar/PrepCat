import os
import httpx
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.paper import PastPaper
from app.models.user import User as UserModel
from app.models.engagement import SavedPaper
from app.api.auth import get_current_user
from app.core.supabase import get_supabase

router = APIRouter(prefix="/papers", tags=["Past Papers"])

SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET_NAME", "pdfs")

@router.post("/upload")
async def upload_paper(
    title: str = Form(...),
    year: int = Form(...),
    exam_type: str = Form(...),
    subject: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    supabase = get_supabase()
    
    # 1. Create a safe path/filename for Supabase
    file_ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{exam_type}/{subject}/{year}/{title.replace(' ', '_')}{file_ext}"
    
    try:
        # 2. Read file content
        file_content = await file.read()
        
        # 3. Upload to Supabase Storage
        # We use upsert=true so it overwrites if the same file is uploaded again
        storage_response = supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=safe_filename,
            file=file_content,
            file_options={
                "cache-control": "3600", 
                "upsert": "true",
                "content-type": "application/pdf"
            }
        )

        
        # 4. Get the public URL
        file_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(safe_filename)
        
        # 5. Save to Database
        db_paper = PastPaper(
            title=title,
            year=year,
            exam_type=exam_type,
            subject=subject,
            file_url=file_url
        )
        db.add(db_paper)
        db.commit()
        db.refresh(db_paper)
        return db_paper
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to Supabase: {str(e)}")

@router.post("/upload-drive")
async def upload_drive_paper(
    title: str = Form(...),
    year: int = Form(...),
    exam_type: str = Form(...),
    subject: str = Form(...),
    drive_file_id: str = Form(...),
    filename: str = Form(...),
    access_token: str = Form(...),
    db: Session = Depends(get_db)
):
    supabase = get_supabase()
    
    # 1. Fetch the file content from Google Drive API
    headers = {"Authorization": f"Bearer {access_token}"}
    drive_url = f"https://www.googleapis.com/drive/v3/files/{drive_file_id}?alt=media"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(drive_url, headers=headers)
            if response.status_code != 200:
                raise Exception(f"Google Drive API Error: {response.text}")
            file_content = response.content
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not download file from Google Drive: {str(e)}")

    # 2. Create a safe path/filename for Supabase
    file_ext = os.path.splitext(filename)[1]
    if not file_ext:
        file_ext = ".pdf"
    safe_filename = f"{exam_type}/{subject}/{year}/{title.replace(' ', '_')}{file_ext}"

    try:
        # 3. Upload to Supabase Storage
        storage_response = supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=safe_filename,
            file=file_content,
            file_options={
                "cache-control": "3600", 
                "upsert": "true",
                "content-type": "application/pdf"
            }
        )

        # 4. Get the public URL
        file_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(safe_filename)
        
        # 5. Save to Database
        db_paper = PastPaper(
            title=title,
            year=year,
            exam_type=exam_type,
            subject=subject,
            file_url=file_url
        )
        db.add(db_paper)
        db.commit()
        db.refresh(db_paper)
        return db_paper
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to Supabase: {str(e)}")

@router.get("/")
def list_papers(db: Session = Depends(get_db)):
    return db.query(PastPaper).all()
@router.delete("/{paper_id}")
def delete_paper(paper_id: int, db: Session = Depends(get_db)):
    paper = db.query(PastPaper).filter(PastPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    # Optional: Delete from Supabase Storage if you have the file path
    # Since we store the full URL, we need to extract the path if we want to delete from storage
    # For now, let's just delete from DB to fix the error
    db.delete(paper)
    db.commit()
    return {"message": "Paper deleted successfully"}

@router.post("/{paper_id}/save")
def save_paper(paper_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    paper = db.query(PastPaper).filter(PastPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
        
    existing_save = db.query(SavedPaper).filter(
        SavedPaper.user_id == current_user.id, 
        SavedPaper.paper_id == paper_id
    ).first()
    
    if existing_save:
        return {"message": "Paper already saved"}
        
    new_save = SavedPaper(user_id=current_user.id, paper_id=paper_id)
    db.add(new_save)
    db.commit()
    return {"message": "Paper saved successfully"}

@router.delete("/{paper_id}/save")
def unsave_paper(paper_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    saved = db.query(SavedPaper).filter(
        SavedPaper.user_id == current_user.id, 
        SavedPaper.paper_id == paper_id
    ).first()
    
    if not saved:
        raise HTTPException(status_code=404, detail="Saved paper not found")
        
    db.delete(saved)
    db.commit()
    return {"message": "Paper removed from saved list"}

@router.get("/user/saved")
def get_saved_papers(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    saved_papers = db.query(SavedPaper).filter(SavedPaper.user_id == current_user.id).all()
    
    papers = []
    for sp in saved_papers:
        paper = db.query(PastPaper).filter(PastPaper.id == sp.paper_id).first()
        if paper:
            papers.append(paper)
            
    return papers

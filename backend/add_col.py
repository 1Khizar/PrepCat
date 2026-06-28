from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://")

engine = create_engine(db_url)
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN papers_opened_count INTEGER DEFAULT 0;"))
        conn.commit()
        print("Column added successfully.")
    except Exception as e:
        print("Error or already exists:", e)

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://")

engine = create_engine(db_url)
with engine.connect() as conn:
    res = conn.execute(text("SELECT id, email, papers_opened_count FROM users"))
    for row in res:
        print(row)

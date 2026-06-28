import os
import sys

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine, Base
from app.models.config import AIConfiguration

def init_db():
    print("Creating ai_configurations table...")
    AIConfiguration.__table__.create(bind=engine, checkfirst=True)
    print("Table created successfully!")

if __name__ == "__main__":
    init_db()
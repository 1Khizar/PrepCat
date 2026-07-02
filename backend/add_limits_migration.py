from app.db.session import engine
from sqlalchemy import text

def run_migration():
    print("Connecting to database...")
    with engine.connect() as conn:
        try:
            print("Adding ai_message_limit_override to users...")
            conn.execute(text("ALTER TABLE users ADD COLUMN ai_message_limit_override INTEGER;"))
            conn.commit()
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("Column ai_message_limit_override already exists in users table.")
            else:
                print(f"Error: {e}")

        try:
            print("Adding default_monthly_message_limit to ai_configurations...")
            conn.execute(text("ALTER TABLE ai_configurations ADD COLUMN default_monthly_message_limit INTEGER DEFAULT 30;"))
            conn.commit()
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("Column default_monthly_message_limit already exists in ai_configurations table.")
            else:
                print(f"Error: {e}")

    print("Migration completed.")

if __name__ == "__main__":
    run_migration()

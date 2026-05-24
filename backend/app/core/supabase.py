import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use service role key for backend operations
supabase: Client = create_client(url, key)

def get_supabase() -> Client:
    return supabase

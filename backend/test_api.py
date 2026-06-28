import requests
import random
import string

def random_string(length=10):
    return ''.join(random.choices(string.ascii_lowercase, k=length))

base_url = "http://localhost:8000"

# 1. Register a new user
username = random_string()
email = f"{username}@test.com"
password = "password123"

resp_reg = requests.post(f"{base_url}/auth/register", json={
    "email": email,
    "username": username,
    "password": password,
    "full_name": "Test User",
    "phone_number": "1234567890"
})

print("Register:", resp_reg.status_code)
if resp_reg.status_code != 200:
    print(resp_reg.text)
    exit(1)

token = resp_reg.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# 2. Open a paper 3 times
for i in range(3):
    resp_open = requests.post(f"{base_url}/auth/activity/paper_opened", headers=headers)
    print(f"Open Paper {i+1}:", resp_open.status_code, resp_open.text)

# 3. Check stats as admin
# Admin credentials (assumed from previous script)
admin_resp = requests.post(f"{base_url}/auth/login", data={"username": "adminkhizar", "password": "password123"})
if admin_resp.status_code == 200:
    admin_token = admin_resp.json().get("access_token")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # We need the user ID of the newly created user.
    # Let's hit the /me endpoint to get it
    resp_me = requests.get(f"{base_url}/auth/me", headers=headers)
    user_id = resp_me.json().get("id")
    print("User ID:", user_id)
    
    stats_resp = requests.get(f"{base_url}/auth/admin/users/{user_id}/stats", headers=admin_headers)
    print("Stats:", stats_resp.status_code, stats_resp.text)
else:
    print("Admin Login failed:", admin_resp.status_code, admin_resp.text)

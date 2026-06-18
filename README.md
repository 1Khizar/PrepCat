# PrepCat 🎓

PrepCat is a comprehensive, modern platform designed for medical students preparing for MDCAT and NUMS entrance exams. It provides a robust student-facing platform for taking quizzes and viewing past papers, alongside a secure Admin Panel for content management and analytics.

---

## 🚀 Tech Stack

### Frontend
* **Framework:** Next.js (React)
* **Styling:** Tailwind CSS + Framer Motion (for animations)
* **Language:** TypeScript
* **Hosting:** Vercel

### Backend
* **Framework:** FastAPI (Python)
* **Database ORM:** SQLAlchemy
* **Authentication:** Custom JWT-based authentication
* **Hosting:** Render (Docker)

### Services & Integrations
* **Database:** Supabase (PostgreSQL)
* **File Storage:** Google Drive Integration (for uploading official past papers via the Admin Panel)

---

## 📂 Project Structure

This is a monorepo containing both the frontend and backend applications:

```text
PrepCat/
├── backend/                # FastAPI Python application
│   ├── app/                # Application logic, models, and routes
│   ├── requirements.txt    # Python dependencies
│   ├── main.py             # FastAPI entry point
│   └── Dockerfile          # Render deployment configuration
│
└── frontend/               # Next.js React application
    ├── src/app/            # Next.js app router pages
    ├── src/components/     # Reusable UI components
    ├── package.json        # Node.js dependencies
    └── tailwind.config.ts  # Tailwind styling configuration
```

---

## 💻 Running Locally

To run this project on your local machine, you will need to start both the backend server and the frontend development server simultaneously.

### 1. Start the Backend

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate your virtual environment (Windows):
   ```bash
   .\.venv\Scripts\activate
   ```
   *(Or on Mac/Linux: `source .venv/bin/activate`)*
3. Create a `.env` file in the `backend` folder based on `.env.example` and add your database/admin credentials.
4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend API will be running on **http://localhost:8000**

### 2. Start the Frontend

1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (only required the first time):
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `frontend` folder with your Google Drive API keys and Supabase credentials. Ensure you have `NEXT_PUBLIC_API_URL=http://localhost:8000` set.
4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be running on **http://localhost:3000**

---

## 🔒 Environment Variables Reference

### Backend (`backend/.env`)
```ini
DATABASE_URL="postgresql://..."
SECRET_KEY="your-secret-jwt-key"

# Admin Setup (Automatically seeds admin user on startup)
ADMIN_EMAIL="adminkhizar@gmail.com"
ADMIN_PASSWORD="your-secure-password"
ADMIN_FULL_NAME="Admin"
```

### Frontend (`frontend/.env.local`)
```ini
NEXT_PUBLIC_API_URL="http://localhost:8000" # Local
# NEXT_PUBLIC_API_URL="https://your-backend.onrender.com" # Production

# Google Drive Integration for Admin Panel
NEXT_PUBLIC_GOOGLE_CLIENT_ID="..."
NEXT_PUBLIC_GOOGLE_API_KEY="..."
NEXT_PUBLIC_GOOGLE_APP_ID="..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

---

## 🌍 Deployment

* **Backend:** Deployed on [Render](https://render.com) using the provided `Dockerfile`. Set the Root Directory to `backend` in the Render dashboard.
* **Frontend:** Deployed on [Vercel](https://vercel.com). Set the Root Directory to `frontend`. Ensure that all `NEXT_PUBLIC_` environment variables are added in Vercel **before** building, or trigger a redeploy after adding them.

---

## 🤝 Google Drive Integration (Admin Panel)
PrepCat allows admins to upload large past papers directly from their Google Drive. 
To enable this, the domain (e.g., `https://prep-buddy-theta.vercel.app`) must be added to the **Authorized JavaScript origins** and **Authorized redirect URIs** in the Google Cloud Console under the corresponding OAuth Client ID.

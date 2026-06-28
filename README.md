# PrepCat 🎓

PrepCat is a comprehensive, modern platform designed for medical students preparing for MDCAT and NUMS entrance exams. It provides a robust student-facing platform for viewing past papers, tracking daily progress, and getting real-time assistance from an AI Tutor, alongside a secure Admin Panel for content management.

---

## ✨ Features

### 🎓 Student Dashboard
* **Past Paper Vault:** Access category-wise past papers for MDCAT and NUMS exams (Biology, Physics, Chemistry, English).
* **Saved Papers:** Bookmark and save important papers for quick access later.
* **Progress Tracking:** 
  * **Daily Streak:** Tracks user activity to build study habits.
  * **Subject Mastery:** Visualizes which subjects the user is saving and focusing on.
  * **Weekly Activity Tracker:** 7-day activity log showing active days.
* **AI Tutor:** 
  * Built-in intelligent chatbot powered by **Groq**.
  * Context-aware: Remembers user details (name, grade, target exam, weak/strong subjects) using efficient pattern matching.
  * Real-time web search integration via **DuckDuckGo** to provide the most up-to-date information when needed.

### 🛡️ Admin Panel
* **Secure Access:** Dedicated administrator login to manage the platform.
* **Content Management:** Upload, edit, and delete past papers.
* **Google Drive Integration:** Upload large past papers directly from Google Drive to the platform seamlessly using the Google Drive Picker API.

### 🎨 Design & UX
* **Modern Interface:** Built with Tailwind CSS and Framer Motion for a sleek, premium, and responsive user experience.
* **Glassmorphism & Micro-animations:** Provides a dynamic and engaging aesthetic to keep students motivated.

---

## 🚀 Tech Stack

### Frontend
* **Framework:** Next.js (React)
* **Styling:** Tailwind CSS + Framer Motion
* **Language:** TypeScript
* **Hosting:** Vercel

### Backend
* **Framework:** FastAPI (Python)
* **Database ORM:** SQLAlchemy
* **Authentication:** Custom JWT-based authentication
* **AI & Tooling:** LangChain, Groq API, DuckDuckGo Search
* **Hosting:** Render (Docker)

### Services & Integrations
* **Database:** Supabase (PostgreSQL)
* **File Storage:** Google Drive Integration (for uploading official past papers)

---

## 📂 Project Structure

This is a monorepo containing both the frontend and backend applications:

```text
PrepCat/
├── backend/                # FastAPI Python application
│   ├── app/                # Application logic, models, and routes
│   │   ├── api/            # API endpoints (auth, papers, questions, ai_tutor)
│   │   ├── core/           # Security, config, JWT
│   │   ├── db/             # Database session setup
│   │   ├── models/         # SQLAlchemy models (user, paper, engagement, ai_memory)
│   │   └── services/       # Business logic (AI Agent with streaming)
│   ├── requirements.txt    # Python dependencies
│   ├── main.py             # FastAPI entry point
│   └── Dockerfile          # Render deployment configuration
│
└── frontend/               # Next.js React application
    ├── src/app/            # Next.js app router pages (login, dashboard, admin)
    ├── src/components/     # Reusable UI components
    ├── src/lib/            # API client and utilities
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

# AI Tutor
GROQ_API_KEY="your-groq-api-key"
GROQ_Model="llama-3.3-70b-versatile"
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

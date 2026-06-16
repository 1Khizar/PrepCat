# PrepBuddy 🩺

## Pakistan's Premier MDCAT & NUMS Personal Study Buddy

PrepBuddy is a premium, high-performance EdTech platform tailored specifically for Pakistani medical aspirants. It transforms the grueling MDCAT and NUMS preparation journey into a streamlined, data-driven, and immersive academic experience.

---

## ✨ Features

### 🏥 For Students (The "Future Doctor" Experience)

- **Clinical Intelligence Dashboard**: A sophisticated, glassmorphic overview of academic standing, mastery goals, and study streaks.
- **Mobile-First Excellence**: Full-viewport responsive hero sections, professional typography, and an intuitively optimized mobile layout across all views.
- **Paper Vault**: Instant access to verified past papers from PMDC, UHS, SZABMU, and NUMS (2015-2024).
- **Smart Quiz Engine**: Practice MCQs with instant expert feedback and detailed solution logic.
- **Mastery Analytics**: Subject-wise progress tracking with visual heatmaps and accuracy indicators.
- **Real-Data Gamification**: Fully functional XP progression, precise daily study streak tracking (🔥), and user engagement logging synchronized seamlessly with the Supabase backend.

### 🛡️ For Administrators (The Control Center)

- **Robust Security & User Management**: Full oversight of registered students, including real-time session termination and instant access revocation for blocked accounts.
- **Google Drive Integration**: Streamlined workflow with a persistent Google Drive connection for directly managing and hosting Past Paper PDFs.
- **Paper Portal**: Clean interface to upload and publish official past papers with year, board, and subject metadata.
- **Data Export**: One-click CSV export for student lists and performance metrics.
- **Content Studio**: Manage the MCQ bank, chapters, and topics directly from the dashboard.
- **Super Admin Security**: Dedicated `/admin` portal with secondary authentication guards.

---

## 🛠️ Technology Stack

PrepBuddy is built using a modern, industry-leading stack for maximum speed and scalability:

- **Frontend**:
  - **Framework**: Next.js 15 (App Router)
  - **Styling**: Tailwind CSS v4 (Glassmorphism & Medical Aesthetics)
  - **Animations**: Framer Motion
  - **Icons**: Lucide React
- **Backend**:
  - **Core**: FastAPI (Python 3.13+)
  - **Manager**: `uv` (High-performance Python package management)
  - **ORM & Migrations**: SQLAlchemy 2.0 with Alembic for scalable schema management
  - **Database**: **Supabase PostgreSQL** (Managed Cloud Database w/ Pooler Connection)
  - **Security**: Robust JWT-based Authentication & Real-time Session Revocation
- **Cloud Infrastructure**:
  - **Database & Auth**: Supabase (PostgreSQL)
  - **File Storage**: Google Drive API Integration for Admin File Management
- **Deployment**:
  - **Frontend**: Vercel
  - **Backend**: Docker / Railway / Render

---

## 🏗️ Project Structure

```text
PrepBuddy/
├── frontend/             # Next.js 15 Workspace
├── backend/              # FastAPI High-Performance Brain
│   ├── app/              # Application Logic
│   │   ├── api/          # REST Endpoints (Auth, Papers, Questions, Analytics)
│   │   ├── models/       # Database Schemas (Supabase Postgres)
│   │   └── core/         # Security, Configurations, Google Drive Integration
│   ├── alembic/          # Database Migration Scripts
│   └── main.py           # API Entry Point
└── README.md             # The Project Encyclopedia
```

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- Python 3.13+
- Supabase Account (URL, Anon Key, Service Role Key)

### 2. Backend Setup

1. Create a `.env` file in `/backend`:

   ```env
   DATABASE_URL="postgresql://postgres.[ID]:[PWD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
   SUPABASE_URL="https://[ID].supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."
   SUPABASE_BUCKET_NAME="pdfs"
   ```

2. Install dependencies & Run:

   ```bash
   cd backend
   uv sync
   uv run python main.py
   ```

### 3. Frontend Setup

1. Create a `.env.local` file in `/frontend`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://[ID].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_..."
   NEXT_PUBLIC_API_URL="http://localhost:8000"
   ```

2. Install & Run:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

*Live Site: [http://localhost:3000](http://localhost:3000)*

---

## 🔐 Credentials (Demo)

| Role           | Username / Email                  | Password          |
| :------------- | :-------------------------------- | :---------------- |
| **Super Admin**| `adminkhizar@gmail.com`           | *Defined in .env* |
| **Demo Admin** | `admin`                           | `admin123`        |
| **Student**    | Create an account via `/register` | User defined      |

---

## 🔮 Future Roadmap

- [ ] **AI Mentor**: Personalized LLM-based tutor to explain complex Biology concepts.

- [ ] **Flashcard Pro**: Interactive Active Recall system for Chemistry formulas.
- [ ] **Mock Battle**: Real-time competitive mock exams against other aspirants.
- [ ] **Mobile App**: Native iOS/Android experience via Capacitor or React Native.

---

*Crafted with 🩺 and precision by the Antigravity Team for the future leaders of Pakistan's healthcare.*

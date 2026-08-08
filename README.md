# Presently – AI-Powered Personalized Gift Recommendation Platform

`Presently` is a startup-grade web platform built to eliminate the guesswork of gift giving using context-aware artificial intelligence and real-world community insights.

---

## 🏗️ Architecture & Technology Stack

* **Frontend**: Next.js 15 (React 19, TypeScript, Tailwind CSS, Shadcn/UI, Framer Motion, Axios, Zod).
* **Backend**: FastAPI (Python 3.13, SQLAlchemy 2.0 Async, Pydantic V2, Alembic, Uvicorn).
* **Database**: PostgreSQL on Neon Serverless.
* **Auth**: Clerk Identity Provider.
* **AI Engine**: OpenAI API (GPT-4o Streaming).
* **Media Cloud**: Cloudinary.

---

## 📂 Project Structure

```
gift-platform/
├── frontend/             # Next.js 15 App Router Frontend
├── backend/              # FastAPI Python 3.13 Backend
├── docs/                 # Platform Architecture & Specification Docs
├── scripts/              # Local Utility & Setup Scripts
├── .github/              # GitHub Actions CI & Templates
└── docker-compose.yml    # Development Container Orchestration
```

---

## ⚡ Quickstart Development Setup

### 1. Environment Configuration
Copy environment variable templates:
```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 2. Running via Docker Compose
```bash
docker-compose up --build
```
* Frontend: `http://localhost:3000`
* Backend API: `http://localhost:8000/api/v1`
* Interactive API Docs: `http://localhost:8000/docs`

### 3. Manual Local Setup

#### Backend Setup (Python 3.13)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup (Node.js 20+)
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Architectural Specifications
Comprehensive specifications are available in the `docs/` directory:
* [Product Requirements Document (PRD)](file:///c:/Users/Lenovo/OneDrive/Desktop/Presently/PRD.md)
* [UI/UX Design Specifications](file:///c:/Users/Lenovo/OneDrive/Desktop/Presently/UI_UX_SPEC.md)
* [Wireframes & User Flow Architecture](file:///c:/Users/Lenovo/OneDrive/Desktop/Presently/WIREFRAMES.md)
* [Database Schema Architecture](file:///c:/Users/Lenovo/OneDrive/Desktop/Presently/DATABASE_SCHEMA.md)
* [REST API Architecture Specification](file:///c:/Users/Lenovo/OneDrive/Desktop/Presently/API_SPEC.md)
* [System Architecture Blueprint](file:///c:/Users/Lenovo/OneDrive/Desktop/Presently/SYSTEM_ARCHITECTURE.md)

---

## 📄 License
MIT License. See [LICENSE](LICENSE) for details.

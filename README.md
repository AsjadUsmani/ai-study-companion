# AI Study Companion

An AI-powered study platform that helps users summarize notes,
ask questions, and generate quizzes from their study materials.

## Features
- Authentication (JWT + cookies)
- Create, edit, delete notes
- AI summarization & re-summarization
- AI tutor mode
- Instant quiz generation

## Tech Stack
- Frontend: Next.js (App Router, TypeScript)
- Backend: Node.js, Express
- AI Service: FastAPI + Gemini
- Database: PostgreSQL

## Architecture
Frontend → Backend → AI Service → Gemini API

## Running Locally
1. Clone repo
2. Create .env files from .env.example
3. Start services
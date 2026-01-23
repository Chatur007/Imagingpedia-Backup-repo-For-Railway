# AI Test Backend Integration

This backend provides AI-powered test evaluation using DeepSeek R1 via OpenRouter.

## Features
- AI-based answer evaluation
- Automatic scoring
- Detailed feedback on lost marks
- Improvement suggestions

## Setup

### 1. Install Dependencies
```bash
cd "src/Backed for AI Test/ai-lms-backend"
npm install
```

### 2. Database Setup
Create a PostgreSQL database named `lms` and run:

```sql
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_image TEXT,
    model_answer TEXT NOT NULL,
    max_marks INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer TEXT NOT NULL,
    ai_score NUMERIC(5,2),
    lost_marks TEXT,
    improvement TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Configure Environment
Update `db.js` with your PostgreSQL credentials:
```javascript
export const pool = new Pool({
    user: "your_username",
    host: "localhost",
    database: "lms",
    password: "your_password",
    port: 5432,
});
```

The `.env` file already contains the OpenRouter API key.

### 4. Start Backend Server
```bash
npm run dev
```

Server runs on http://localhost:3000

## API Endpoints

### POST /submission
Submit an answer for AI evaluation.

**Request:**
```json
{
  "student_id": 123,
  "question_id": 1,
  "answer": "Student's answer text",
  "model_answer": "Expert answer (optional if in DB)",
  "max_marks": 10
}
```

**Response:**
```json
{
  "id": 1,
  "student_id": 123,
  "question_id": 1,
  "answer": "Student's answer text",
  "ai_score": 7.5,
  "lost_marks": "Missing key concepts: X, Y",
  "improvement": "Include more detail about...",
  "created_at": "2026-01-20T..."
}
```

### POST /questions
Create a new question (for admin use).

**Request:**
```json
{
  "question_image": "https://...",
  "model_answer": "Expert answer",
  "max_marks": 10
}
```

## Integration with Frontend

The frontend automatically sends answers to the backend when tests are submitted. Results include:
- AI Score
- Areas where marks were lost
- Suggestions for improvement
- Sample expert answer comparison

## Notes
- The backend uses DeepSeek R1 (free tier) via OpenRouter
- Evaluation takes a few seconds per question
- Database is optional - backend accepts model_answer in request

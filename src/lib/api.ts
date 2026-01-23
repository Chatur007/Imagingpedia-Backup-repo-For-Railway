// API client for backend integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export interface Question {
  id: number;
  question_image: string;
  model_answer: string;
  max_marks: number;
}

export interface SubmissionPayload {
  student_id: number;
  question_id: number;
  answer: string;
}

export interface SubmissionResult {
  id: number;
  student_id: number;
  question_id: number;
  answer: string;
  ai_score: number;
  lost_marks: string;
  improvement: string;
}

export const api = {
  // Create a new question
  async createQuestion(data: {
    question_image: string;
    model_answer: string;
    max_marks: number;
  }): Promise<Question> {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create question");
    return response.json();
  },

  // Submit an answer for AI evaluation
  async submitAnswer(data: SubmissionPayload): Promise<SubmissionResult> {
    const response = await fetch(`${API_BASE_URL}/submission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to submit answer");
    return response.json();
  },
};

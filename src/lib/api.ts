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
  // Generic GET request
  async get<T = any>(endpoint: string): Promise<{ data: T }> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`GET ${endpoint} failed`);
    const data = await response.json();
    return { data };
  },

  // Generic POST request
  async post<T = any>(endpoint: string, body?: any): Promise<{ data: T }> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) throw new Error(`POST ${endpoint} failed`);
    const data = await response.json();
    return { data };
  },

  // Generic PUT request
  async put<T = any>(endpoint: string, body?: any): Promise<{ data: T }> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) throw new Error(`PUT ${endpoint} failed`);
    const data = await response.json();
    return { data };
  },

  // Generic DELETE request
  async delete<T = any>(endpoint: string): Promise<{ data: T }> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`DELETE ${endpoint} failed`);
    const data = await response.json();
    return { data };
  },

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

import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Get all questions
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM questions ORDER BY subject_id, id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Questions fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all questions for a subject
router.get("/subject/:subjectId", async (req, res) => {
  try {
    const { subjectId } = req.params;
    const result = await pool.query(
      "SELECT * FROM questions WHERE subject_id = $1 ORDER BY id",
      [subjectId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Questions fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get single question by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM questions WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Question fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Create a new question
router.post("/", async (req, res) => {
  try {
    const { subject_id, question_text, question_image, model_answer, max_marks } = req.body;

    if (!subject_id || !question_text || !question_image || !model_answer || !max_marks) {
      return res.status(400).json({
        error: "Missing required fields: subject_id, question_text, question_image, model_answer, max_marks"
      });
    }

    const result = await pool.query(
      "INSERT INTO questions(subject_id, question_text, question_image, model_answer, max_marks) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [subject_id, question_text, question_image, model_answer, max_marks]
    );

    console.log("Question created:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Question creation error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update a question
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_id, question_text, question_image, model_answer, max_marks } = req.body;

    // Check if question exists
    const exists = await pool.query("SELECT id FROM questions WHERE id = $1", [id]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    const result = await pool.query(
      "UPDATE questions SET subject_id = $1, question_text = $2, question_image = $3, model_answer = $4, max_marks = $5 WHERE id = $6 RETURNING *",
      [subject_id, question_text, question_image, model_answer, max_marks, id]
    );

    console.log("Question updated:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Question update error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete a question
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if question exists
    const exists = await pool.query("SELECT id FROM questions WHERE id = $1", [id]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    await pool.query("DELETE FROM questions WHERE id = $1", [id]);

    console.log("Question deleted:", id);
    res.json({ message: "Question deleted successfully", id });
  } catch (error) {
    console.error("Question deletion error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;

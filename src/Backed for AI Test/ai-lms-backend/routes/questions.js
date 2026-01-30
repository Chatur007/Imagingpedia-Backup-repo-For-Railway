import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../db.js";

const router = express.Router();

// Configure multer disk storage
const uploadsPath = path.join(process.cwd(), "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ext;
    cb(null, name);
  },
});
const upload = multer({ storage });

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

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { subject_id, question_text, question_image, model_answer, max_marks } = req.body;
    let imagePath = question_image || null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    if (!subject_id || !question_text || !model_answer || !max_marks) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      "INSERT INTO questions(subject_id, question_text, question_image, model_answer, max_marks) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [subject_id, question_text, imagePath, model_answer, max_marks]
    );

    console.log("Question created:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Question creation error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update a question (accepts file)
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_id, question_text, question_image, model_answer, max_marks } = req.body;

    // Check if question exists
    const exists = await pool.query("SELECT * FROM questions WHERE id = $1", [id]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    let imagePath = question_image || exists.rows[0].question_image || null;
    if (req.file) {
      // remove old file if it was stored in /uploads
      const oldPath = exists.rows[0].question_image;
      if (oldPath && oldPath.startsWith("/uploads/")) {
        const oldFile = path.join(process.cwd(), oldPath.replace("/", ""));
        try { fs.unlinkSync(oldFile); } catch (e) { /* ignore */ }
      }
      imagePath = `/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      "UPDATE questions SET subject_id = $1, question_text = $2, question_image = $3, model_answer = $4, max_marks = $5 WHERE id = $6 RETURNING *",
      [subject_id, question_text, imagePath, model_answer, max_marks, id]
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
    const exists = await pool.query("SELECT * FROM questions WHERE id = $1", [id]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    // If question_image points to uploads, remove the file
    const img = exists.rows[0].question_image;
    if (img && img.startsWith("/uploads/")) {
      const fileOnDisk = path.join(process.cwd(), img.replace("/", ""));
      try { fs.unlinkSync(fileOnDisk); } catch (e) { /* ignore */ }
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

import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { student_name, subject_id, email } = req.body;

    if (!student_name || !subject_id || !email) {
      return res.status(400).json({ error: "Missing required fields: student_name, subject_id, email" });
    }

    const result = await pool.query(
      "INSERT INTO student (student_name, subject_id, email) VALUES($1, $2, $3) RETURNING *",
      [student_name, subject_id, email]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Student creation error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;

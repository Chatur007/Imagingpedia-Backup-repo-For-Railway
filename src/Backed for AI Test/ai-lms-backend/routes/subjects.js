import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Get all subjects
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM subjects ORDER BY subject_name");
    res.json(result.rows);
  } catch (error) {
    console.error("Subjects fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get a single subject by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM subjects WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subject not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Subject fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Get all subjects with hierarchical structure
router.get("/", async (req, res) => {
  try {
    const { includeHierarchy } = req.query;
    
    if (includeHierarchy === 'true') {
      // Get subjects with parent information
      const result = await pool.query(`
        SELECT 
          s.id,
          s.subject_name,
          s.subject_description,
          s.parent_id,
          p.subject_name as parent_name,
          s.display_order
        FROM subjects s
        LEFT JOIN subjects p ON s.parent_id = p.id
        ORDER BY COALESCE(p.display_order, s.display_order), s.display_order
      `);
      res.json(result.rows);
    } else {
      // Get all subjects (flat list)
      const result = await pool.query("SELECT * FROM subjects ORDER BY display_order, subject_name");
      res.json(result.rows);
    }
  } catch (error) {
    console.error("Subjects fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get only parent subjects (main categories)
router.get("/parents", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM subjects WHERE parent_id IS NULL ORDER BY display_order, subject_name"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Parent subjects fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get subcategories for a specific parent subject
router.get("/parent/:parentId/children", async (req, res) => {
  try {
    const { parentId } = req.params;
    
    // Check if parent exists
    const parentCheck = await pool.query("SELECT * FROM subjects WHERE id = $1", [parentId]);
    if (parentCheck.rows.length === 0) {
      return res.status(404).json({ error: "Parent subject not found" });
    }
    
    const result = await pool.query(
      "SELECT * FROM subjects WHERE parent_id = $1 ORDER BY display_order, subject_name",
      [parentId]
    );
    
    res.json({
      parent: parentCheck.rows[0],
      children: result.rows
    });
  } catch (error) {
    console.error("Subcategories fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Create a new subject (with optional parent for subcategories)
router.post("/", async (req, res) => {
  try {
    const { subject_name, subject_description, parent_id, display_order } = req.body;
    
    if (!subject_name || subject_name.trim() === "") {
      return res.status(400).json({ error: "Subject name is required" });
    }
    
    // If parent_id is provided, verify parent exists
    if (parent_id) {
      const parentCheck = await pool.query("SELECT * FROM subjects WHERE id = $1", [parent_id]);
      if (parentCheck.rows.length === 0) {
        return res.status(400).json({ error: "Parent subject not found" });
      }
    }
    
    // Check if subject already exists with same name and parent
    const existingSubject = await pool.query(
      "SELECT * FROM subjects WHERE LOWER(subject_name) = LOWER($1) AND (parent_id = $2 OR (parent_id IS NULL AND $2 IS NULL))",
      [subject_name, parent_id || null]
    );
    
    if (existingSubject.rows.length > 0) {
      return res.status(400).json({ error: "Subject already exists" });
    }
    
    const result = await pool.query(
      `INSERT INTO subjects (subject_name, subject_description, parent_id, display_order) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [subject_name, subject_description || null, parent_id || null, display_order || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Subject creation error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get a single subject by ID (with parent and children info)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get subject with parent information
    const result = await pool.query(`
      SELECT 
        s.id,
        s.subject_name,
        s.subject_description,
        s.parent_id,
        p.subject_name as parent_name,
        s.display_order
      FROM subjects s
      LEFT JOIN subjects p ON s.parent_id = p.id
      WHERE s.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subject not found" });
    }
    
    // Get children (subcategories) if any
    const childrenResult = await pool.query(
      "SELECT * FROM subjects WHERE parent_id = $1 ORDER BY display_order, subject_name",
      [id]
    );
    
    res.json({
      ...result.rows[0],
      children: childrenResult.rows
    });
  } catch (error) {
    console.error("Subject fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update a subject
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_name, subject_description, parent_id, display_order } = req.body;
    
    // Check if subject exists
    const subjectCheck = await pool.query("SELECT * FROM subjects WHERE id = $1", [id]);
    if (subjectCheck.rows.length === 0) {
      return res.status(404).json({ error: "Subject not found" });
    }
    
    // If parent_id is being changed, verify new parent exists
    if (parent_id !== undefined && parent_id !== null) {
      // Prevent subject from being its own parent
      if (parseInt(parent_id) === parseInt(id)) {
        return res.status(400).json({ error: "Subject cannot be its own parent" });
      }
      
      const parentCheck = await pool.query("SELECT * FROM subjects WHERE id = $1", [parent_id]);
      if (parentCheck.rows.length === 0) {
        return res.status(400).json({ error: "Parent subject not found" });
      }
    }
    
    const result = await pool.query(
      `UPDATE subjects 
       SET subject_name = COALESCE($1, subject_name),
           subject_description = COALESCE($2, subject_description),
           parent_id = $3,
           display_order = COALESCE($4, display_order)
       WHERE id = $5
       RETURNING *`,
      [subject_name, subject_description, parent_id !== undefined ? parent_id : subjectCheck.rows[0].parent_id, display_order, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Subject update error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete a subject by ID
router.delete("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    
    // Start a transaction
    await client.query("BEGIN");
    
    // Check if subject exists
    const subjectCheck = await client.query("SELECT * FROM subjects WHERE id = $1", [id]);
    if (subjectCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Subject not found" });
    }
    
    // Step 1: Get all questions for this subject
    const questionsResult = await client.query("SELECT id FROM questions WHERE subject_id = $1", [id]);
    const questionIds = questionsResult.rows.map(q => q.id);
    
    // Step 2: Delete all submissions related to these questions
    if (questionIds.length > 0) {
      const deleteSubmissionsResult = await client.query(
        "DELETE FROM submissions WHERE question_id = ANY($1)",
        [questionIds]
      );
      console.log(`Deleted ${deleteSubmissionsResult.rowCount} submissions`);
    }
    
    // Step 3: Delete all questions associated with this subject
    const deleteQuestionsResult = await client.query("DELETE FROM questions WHERE subject_id = $1", [id]);
    console.log(`Deleted ${deleteQuestionsResult.rowCount} questions for subject ${id}`);
    
    // Step 4: Delete all students associated with this subject
    const deleteStudentsResult = await client.query("DELETE FROM student WHERE subject_id = $1", [id]);
    console.log(`Deleted ${deleteStudentsResult.rowCount} students for subject ${id}`);
    
    // Step 5: Delete the subject
    const result = await client.query("DELETE FROM subjects WHERE id = $1 RETURNING *", [id]);
    
    // Commit the transaction
    await client.query("COMMIT");
    
    res.status(200).json({ message: "Subject and all related data deleted successfully", subject: result.rows[0] });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError.message);
    }
    console.error("Subject deletion error:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

export default router;

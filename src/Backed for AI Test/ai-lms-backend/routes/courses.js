import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../db.js";

const router = express.Router();


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


router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, 
        COUNT(DISTINCT cv.id) as video_count,
        COUNT(DISTINCT ci.id) as image_count
      FROM courses c
      LEFT JOIN course_videos cv ON c.id = cv.course_id
      LEFT JOIN course_images ci ON c.id = ci.course_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Courses fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const courseResult = await pool.query("SELECT * FROM courses WHERE id = $1", [id]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    const videosResult = await pool.query("SELECT * FROM course_videos WHERE course_id = $1 ORDER BY video_order ASC", [id]);
    const imagesResult = await pool.query("SELECT * FROM course_images WHERE course_id = $1 ORDER BY image_order ASC", [id]);

    const course = courseResult.rows[0];
    course.videos = videosResult.rows;
    course.images = imagesResult.rows;

    res.json(course);
  } catch (error) {
    console.error("Course fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { course_name, course_description, course_image } = req.body;
    let imagePath = course_image || null;
    
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    if (!course_name || !course_description) {
      return res.status(400).json({ error: "Course name and description are required" });
    }

    const result = await pool.query(
      "INSERT INTO courses (course_name, course_description, course_image) VALUES ($1, $2, $3) RETURNING *",
      [course_name, course_description, imagePath]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Course creation error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const { course_name, course_description, course_image } = req.body;


    const exists = await pool.query("SELECT * FROM courses WHERE id = $1", [id]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    let imagePath = course_image || exists.rows[0].course_image || null;
    if (req.file) {

      const oldPath = exists.rows[0].course_image;
      if (oldPath && oldPath.startsWith("/uploads/")) {
        const oldFile = path.join(process.cwd(), oldPath.replace("/", ""));
        try { fs.unlinkSync(oldFile); } catch (e) {  }
      }
      imagePath = `/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      "UPDATE courses SET course_name = $1, course_description = $2, course_image = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
      [course_name, course_description, imagePath, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Course update error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


router.delete("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query("BEGIN");

 
    const courseCheck = await client.query("SELECT * FROM courses WHERE id = $1", [id]);
    if (courseCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Course not found" });
    }

 
    const courseImage = courseCheck.rows[0].course_image;
    if (courseImage && courseImage.startsWith("/uploads/")) {
      const fileOnDisk = path.join(process.cwd(), courseImage.replace("/", ""));
      try { fs.unlinkSync(fileOnDisk); } catch (e) { }
    }


    const imagesResult = await client.query("DELETE FROM course_images WHERE course_id = $1", [id]);
    console.log(`Deleted ${imagesResult.rowCount} images`);

   
    const videosResult = await client.query("DELETE FROM course_videos WHERE course_id = $1", [id]);
    console.log(`Deleted ${videosResult.rowCount} videos`);


    const result = await client.query("DELETE FROM courses WHERE id = $1 RETURNING *", [id]);

    await client.query("COMMIT");

    res.status(200).json({ message: "Course and all related data deleted successfully", course: result.rows[0] });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError.message);
    }
    console.error("Course deletion error:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});


router.post("/:courseId/videos", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { video_title, video_url, video_order } = req.body;

    if (!video_title || !video_url) {
      return res.status(400).json({ error: "Video title and URL are required" });
    }

  
    if (!video_url.includes("youtube.com/embed/") && !video_url.includes("youtu.be/")) {
      return res.status(400).json({ error: "Invalid YouTube URL format. Please use embed format." });
    }

    const result = await pool.query(
      "INSERT INTO course_videos (course_id, video_title, video_url, video_order) VALUES ($1, $2, $3, $4) RETURNING *",
      [courseId, video_title, video_url, video_order || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Video creation error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


router.put("/:courseId/videos/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;
    const { video_title, video_url, video_order } = req.body;

    const result = await pool.query(
      "UPDATE course_videos SET video_title = $1, video_url = $2, video_order = $3 WHERE id = $4 RETURNING *",
      [video_title, video_url, video_order, videoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Video update error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


router.delete("/:courseId/videos/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    const result = await pool.query("DELETE FROM course_videos WHERE id = $1 RETURNING *", [videoId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.status(200).json({ message: "Video deleted successfully", video: result.rows[0] });
  } catch (error) {
    console.error("Video deletion error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


router.post("/:courseId/images", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { image_url, image_title, image_order } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    const result = await pool.query(
      "INSERT INTO course_images (course_id, image_url, image_title, image_order) VALUES ($1, $2, $3, $4) RETURNING *",
      [courseId, image_url, image_title || "Course Image", image_order || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Image creation error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


router.put("/:courseId/images/:imageId", async (req, res) => {
  try {
    const { imageId } = req.params;
    const { image_url, image_title, image_order } = req.body;

    const result = await pool.query(
      "UPDATE course_images SET image_url = $1, image_title = $2, image_order = $3 WHERE id = $4 RETURNING *",
      [image_url, image_title, image_order, imageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Image update error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


router.delete("/:courseId/images/:imageId", async (req, res) => {
  try {
    const { imageId } = req.params;

    const result = await pool.query("DELETE FROM course_images WHERE id = $1 RETURNING *", [imageId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.status(200).json({ message: "Image deleted successfully", image: result.rows[0] });
  } catch (error) {
    console.error("Image deletion error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


router.get("/:id/stats", async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await pool.query(`
      SELECT 
        c.id,
        c.course_name,
        COUNT(DISTINCT cv.id) as total_videos,
        COUNT(DISTINCT ci.id) as total_images
      FROM courses c
      LEFT JOIN course_videos cv ON c.id = cv.course_id
      LEFT JOIN course_images ci ON c.id = ci.course_id
      WHERE c.id = $1
      GROUP BY c.id, c.course_name
    `, [id]);

    if (stats.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(stats.rows[0]);
  } catch (error) {
    console.error("Stats fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;

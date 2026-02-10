import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Admin Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log(`[Admin Login] Attempt: username="${username}"`);

    if (!username || !password) {
      console.log("[Admin Login] Missing username or password");
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Find admin user
    console.log(`[Admin Login] Querying database for username: ${username}`);
    const result = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      console.log(`[Admin Login] User not found: ${username}`);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const admin = result.rows[0];
    console.log(`[Admin Login] User found: ${admin.username}, email: ${admin.email}`);
    console.log(`[Admin Login] Stored hash: ${admin.password.substring(0, 20)}...`);

    // Compare password
    console.log("[Admin Login] Comparing passwords with bcrypt...");
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      console.log("[Admin Login] Password mismatch for user:", username);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    console.log("[Admin Login] Password valid! Generating token...");

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, email: admin.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("[Admin Login] Login successful for:", username);
    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("[Admin Login] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify Admin Token
router.post("/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("[Admin Verify] No token provided");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    console.log("[Admin Verify] Verifying token...");
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("[Admin Verify] Token valid for user:", decoded.username);
    res.json({ success: true, admin: decoded });
  } catch (error) {
    console.log("[Admin Verify] Token verification failed:", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
});

// Admin Logout (client-side mainly, but we can invalidate token)
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;

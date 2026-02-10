import { pool } from "./db.js";
import bcrypt from "bcrypt";

async function addAdminTable() {
  try {
    // Create admin table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log("Admin table created successfully");

    // Insert default admin user (username: admin, password: admin123)
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const result = await pool.query(
      "INSERT INTO admins (username, email, password) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING RETURNING *",
      ["admin", "admin@imagingpedia.com", hashedPassword]
    );

    if (result.rows.length > 0) {
      console.log("Default admin user created. Username: admin, Password: admin123");
    } else {
      console.log("Admin user already exists");
    }

  } catch (error) {
    console.error("Error creating admin table:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addAdminTable();

import bcrypt from "bcrypt";
import { pool } from "./db.js";

async function updateAdminPassword() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash("chatur@123", 10);
    
    // Update the admin user with hashed password
    const result = await pool.query(
      "UPDATE admins SET password = $1 WHERE username = $2 RETURNING *",
      [hashedPassword, "chatur"]
    );

    if (result.rows.length > 0) {
      console.log("✓ Password updated successfully!");
      console.log("Username: chatur");
      console.log("Password: chatur@123");
      console.log("\nYou can now log in with these credentials.");
    } else {
      console.log("✗ Admin user 'chatur' not found in database.");
      console.log("Please create the user first with the correct username.");
    }

  } catch (error) {
    console.error("Error updating password:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateAdminPassword();

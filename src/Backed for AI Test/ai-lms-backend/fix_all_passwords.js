import bcrypt from "bcrypt";
import { pool } from "./db.js";

async function hashAllPasswords() {
  try {
    console.log("\n========================================");
    console.log("HASHING ALL PLAIN TEXT PASSWORDS");
    console.log("========================================\n");

    // Get all admins
    const result = await pool.query("SELECT id, username, password FROM admins");

    if (result.rows.length === 0) {
      console.log("No admin users found!");
      process.exit(1);
    }

    console.log(`Found ${result.rows.length} admin users\n`);

    for (const admin of result.rows) {
      // Check if password is already hashed (bcrypt hashes start with $2b$)
      if (admin.password.startsWith("$2b$")) {
        console.log(`✓ ${admin.username} - Already hashed (skipping)`);
        continue;
      }

      // Password is plain text, hash it
      console.log(`⏳ ${admin.username} - Hashing password...`);
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      // Update the password
      await pool.query(
        "UPDATE admins SET password = $1 WHERE id = $2",
        [hashedPassword, admin.id]
      );

      console.log(`✓ ${admin.username} - Password hashed and updated!\n`);
    }

    console.log("========================================");
    console.log("✓ ALL PASSWORDS SUCCESSFULLY HASHED!");
    console.log("========================================\n");
    console.log("You can now log in with your credentials.\n");

  } catch (error) {
    console.error("✗ Error hashing passwords:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

hashAllPasswords();

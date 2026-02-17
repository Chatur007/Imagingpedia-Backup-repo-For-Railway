import bcrypt from "bcrypt";
import { pool } from "./db.js";

async function setupAdmin() {
  try {
    console.log("\n========================================");
    console.log("SETTING UP DEFAULT ADMIN USER");
    console.log("========================================\n");

    // Check if admin exists
    const checkResult = await pool.query("SELECT COUNT(*) as count FROM admins");
    const adminCount = checkResult.rows[0].count;

    if (adminCount > 0) {
      console.log(`✓ Admin user(s) already exist (${adminCount} found)`);
      const admins = await pool.query("SELECT id, username, email FROM admins");
      console.log("\nExisting admins:");
      admins.rows.forEach((admin) => {
        console.log(`  - ${admin.username} (${admin.email || "no email"})`);
      });
      console.log("");
      await pool.end();
      return;
    }

    const username = "admin";
    const password = "admin123";
    const email = "admin@imagingpedia.com";

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO admins (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, hashedPassword, email]
    );

    console.log("✓ Default admin user created successfully!\n");
    console.log("Login credentials:");
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
    console.log(`  Email: ${email}\n`);
    console.log(" IMPORTANT: Change this password after first login!\n");

    console.log("Admin details:");
    console.log(`  ID: ${result.rows[0].id}`);
    console.log(`  Username: ${result.rows[0].username}`);
    console.log(`  Email: ${result.rows[0].email}\n`);

    console.log("You can now login at: http://localhost:8081/admin/login\n");

    console.log("========================================\n");

    await pool.end();
  } catch (error) {
    console.error("\n Error setting up admin:", error.message);
    console.error("\nMake sure:");
    console.log("  1. PostgreSQL is running");
    console.log("  2. Database is created");
    console.log("  3. .env file has correct DATABASE_URL\n");
    process.exit(1);
  }
}

setupAdmin();

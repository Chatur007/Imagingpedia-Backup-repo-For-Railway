import bcrypt from "bcrypt";
import { pool } from "./db.js";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createNewAdmin() {
  try {
    console.log("\n========================================");
    console.log("CREATE NEW ADMIN USER");
    console.log("========================================\n");


    const username = await question("Enter username: ");
    
    if (!username.trim()) {
      console.log("✗ Username cannot be empty!");
      process.exit(1);
    }

    const existingUser = await pool.query(
      "SELECT * FROM admins WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      console.log(`✗ Username '${username}' already exists!`);
      process.exit(1);
    }


    const password = await question("Enter password: ");
    
    if (!password.trim() || password.length < 6) {
      console.log("✗ Password must be at least 6 characters!");
      process.exit(1);
    }


    const email = await question("Enter email (optional): ");


    console.log("\nHashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);


    const result = await pool.query(
      "INSERT INTO admins (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
      [username, email.trim() || null, hashedPassword]
    );

    if (result.rows.length > 0) {
      const admin = result.rows[0];
      console.log("\n✓ New admin user created successfully!\n");
      console.log("========================================");
      console.log("ADMIN DETAILS:");
      console.log("========================================");
      console.log(`Username: ${admin.username}`);
      console.log(`Email: ${admin.email || "Not provided"}`);
      console.log(`Created: ${admin.created_at}`);
      console.log("========================================\n");
      console.log("Login with these credentials at /admin/login\n");
    } else {
      console.log("✗ Failed to create admin user!");
      process.exit(1);
    }

  } catch (error) {
    console.error("✗ Error creating admin:", error.message);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
  }
}

createNewAdmin();

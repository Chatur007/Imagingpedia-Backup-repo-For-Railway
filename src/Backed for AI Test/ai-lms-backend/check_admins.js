import { pool } from "./db.js";

async function checkAdmins() {
  try {
    console.log("\n========================================");
    console.log("CHECKING ADMIN TABLE");
    console.log("========================================\n");

    const result = await pool.query("SELECT id, username, email, created_at FROM admins");

    if (result.rows.length === 0) {
      console.log("✗ No admin users found in database!");
      console.log("\nCreate an admin user by running: node create_admin.js\n");
    } else {
      console.log("✓ Found admin users:\n");
      result.rows.forEach((admin, index) => {
        console.log(`${index + 1}. Username: ${admin.username}`);
        console.log(`   Email: ${admin.email || "Not provided"}`);
        console.log(`   Created: ${admin.created_at}\n`);
      });
    }

    // Also check if the table exists
    const tableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admins')"
    );
    
    console.log(`\nAdmin table exists: ${tableCheck.rows[0].exists}`);
    console.log("========================================\n");

  } catch (error) {
    console.error("✗ Error checking admin table:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkAdmins();

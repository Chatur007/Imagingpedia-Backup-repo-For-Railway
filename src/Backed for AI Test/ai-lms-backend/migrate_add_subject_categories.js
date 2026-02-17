import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateAddSubjectCategories() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Add subject categories support...');
    
    await client.query('BEGIN');
    

    console.log('Adding parent_id column to subjects table...');
    await client.query(`
      ALTER TABLE subjects 
      ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE
    `);

    console.log('Adding subject_description column...');
    await client.query(`
      ALTER TABLE subjects 
      ADD COLUMN IF NOT EXISTS subject_description TEXT
    `);
    

    console.log('Adding display_order column...');
    await client.query(`
      ALTER TABLE subjects 
      ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0
    `);
    
    console.log('Creating index on parent_id...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_subjects_parent_id ON subjects(parent_id)
    `);
    
    await client.query('COMMIT');
    
    console.log('Migration completed successfully!');
    console.log('You can now create hierarchical subjects with parent-child relationships.');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(' Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}


migrateAddSubjectCategories()
  .then(() => {
    console.log('\nAll done! Your subjects table now supports categories and subcategories.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n Migration error:', err);
    process.exit(1);
  });

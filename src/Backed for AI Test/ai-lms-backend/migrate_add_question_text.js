import { pool } from './db.js';

const run = async () => {
  try {
    console.log('Running migration: add question_text column if missing');

    await pool.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_text TEXT;`);

    await pool.query(`UPDATE questions SET question_text = 'Describe the image' WHERE question_text IS NULL;`);

    await pool.query(`ALTER TABLE questions ALTER COLUMN question_text SET NOT NULL;`);

    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
};

run();

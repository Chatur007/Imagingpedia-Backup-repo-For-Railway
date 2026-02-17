import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function populateRadiologySubjects() {
  const client = await pool.connect();
  
  try {
    console.log('Starting subject population...\n');
    
    await client.query('BEGIN');
    
 
    console.log('Creating FRCR parent subject...');
    const frcrResult = await client.query(`
      INSERT INTO subjects (subject_name, subject_description, parent_id, display_order)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, ['FRCR', 'Fellowship of the Royal College of Radiologists', null, 1]);
    
    const frcrId = frcrResult.rows[0]?.id || (await client.query("SELECT id FROM subjects WHERE subject_name = 'FRCR'")).rows[0].id;
    console.log(`FRCR created with ID: ${frcrId}\n`);
    

    console.log('Creating FRCR subcategories...');
    const frcrSubcategories = [
      { name: 'FRCR - Short Cases', description: 'FRCR Short Case Examinations', order: 1 },
      { name: 'FRCR - Long Cases', description: 'FRCR Long Case Examinations', order: 2 },
      { name: 'FRCR - Viva', description: 'FRCR Viva Voce Examinations', order: 3 }
    ];
    
    for (const sub of frcrSubcategories) {
      await client.query(`
        INSERT INTO subjects (subject_name, subject_description, parent_id, display_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [sub.name, sub.description, frcrId, sub.order]);
      console.log(`  ${sub.name}`);
    }
    console.log('');
    
    console.log('Creating standalone subjects...');
    const standaloneSubjects = [
      { name: 'EBIR Mock Exam', description: 'European Board of Interventional Radiology Mock Examination', order: 2 },
      { name: 'Breast Imaging Assessment', description: 'Comprehensive Breast Imaging Evaluation', order: 3 },
      { name: 'Chest X-Ray Timed Set', description: 'Time-limited Chest Radiograph Interpretation', order: 4 },
      { name: 'Emergency X-Ray Challenge', description: 'Acute Emergency Radiograph Assessment', order: 5 },
      { name: 'Radiology Anatomy', description: 'Cross-sectional Anatomy for Radiologists', order: 6 },
      { name: 'Interventional Radiology Viva Prep', description: 'IR Viva Preparation and Practice', order: 7 }
    ];
    
    for (const subject of standaloneSubjects) {
      await client.query(`
        INSERT INTO subjects (subject_name, subject_description, parent_id, display_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [subject.name, subject.description, null, subject.order]);
      console.log(`  ${subject.name}`);
    }
    console.log('');
    
    await client.query('COMMIT');
    
 
    console.log('Final Subject Structure:');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const parentSubjects = await client.query(`
      SELECT id, subject_name, subject_description, display_order 
      FROM subjects 
      WHERE parent_id IS NULL 
      ORDER BY display_order
    `);
    
    for (const parent of parentSubjects.rows) {
      console.log(`${parent.display_order}. ${parent.subject_name}`);
      console.log(`   ${parent.subject_description}`);
      
      const children = await client.query(`
        SELECT subject_name, subject_description, display_order
        FROM subjects
        WHERE parent_id = $1
        ORDER BY display_order
      `, [parent.id]);
      
      if (children.rows.length > 0) {
        for (const child of children.rows) {
          console.log(`   ${parent.display_order}.${child.display_order} ${child.subject_name}`);
        }
      }
      console.log('');
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('All subjects created successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the population
populateRadiologySubjects()
  .then(() => {
    console.log('\n Subject population complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n Population failed:', err);
    process.exit(1);
  });

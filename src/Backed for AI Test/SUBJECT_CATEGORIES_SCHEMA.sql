-- Database Schema Update for Subject Categories
-- This adds hierarchical structure to subjects table

-- Add new columns to subjects table
ALTER TABLE subjects 
ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS subject_description TEXT,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_parent_id ON subjects(parent_id);

-- Sample data: Create hierarchical subjects structure
-- Example: FRCR as parent with subcategories

-- First, insert parent subjects (main exam categories)
INSERT INTO subjects (subject_name, subject_description, parent_id, display_order) VALUES
    ('FRCR', 'Fellowship of the Royal College of Radiologists', NULL, 1),
    ('EBIR Mock Exam', 'European Board of Interventional Radiology Mock Examination', NULL, 2),
    ('Breast Imaging Assessment', 'Comprehensive Breast Imaging Evaluation', NULL, 3),
    ('Chest X-Ray Timed Set', 'Time-limited Chest Radiograph Interpretation', NULL, 4),
    ('Emergency X-Ray Challenge', 'Acute Emergency Radiograph Assessment', NULL, 5),
    ('Radiology Anatomy', 'Cross-sectional Anatomy for Radiologists', NULL, 6),
    ('Interventional Radiology Viva Prep', 'IR Viva Preparation and Practice', NULL, 7)
ON CONFLICT DO NOTHING;

-- Now insert FRCR subcategories (these will reference FRCR's id as parent_id)
-- Note: You need to replace '1' with the actual ID of FRCR from your database
DO $$
DECLARE
    frcr_id INTEGER;
BEGIN
    -- Get the FRCR subject ID
    SELECT id INTO frcr_id FROM subjects WHERE subject_name = 'FRCR' LIMIT 1;
    
    IF frcr_id IS NOT NULL THEN
        -- Insert FRCR subcategories
        INSERT INTO subjects (subject_name, subject_description, parent_id, display_order) VALUES
            ('FRCR - Short Cases', 'FRCR Short Case Examinations', frcr_id, 1),
            ('FRCR - Long Cases', 'FRCR Long Case Examinations', frcr_id, 2),
            ('FRCR - Viva', 'FRCR Viva Voce Examinations', frcr_id, 3)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Query examples to retrieve hierarchical data:

-- Get all parent subjects (main categories)
-- SELECT * FROM subjects WHERE parent_id IS NULL ORDER BY display_order;

-- Get all subcategories for a specific parent (e.g., FRCR)
-- SELECT * FROM subjects WHERE parent_id = (SELECT id FROM subjects WHERE subject_name = 'FRCR') ORDER BY display_order;

-- Get subjects with their parent names (if any)
-- SELECT 
--     s.id,
--     s.subject_name,
--     s.subject_description,
--     p.subject_name as parent_name,
--     s.display_order
-- FROM subjects s
-- LEFT JOIN subjects p ON s.parent_id = p.id
-- ORDER BY COALESCE(p.display_order, s.display_order), s.display_order;

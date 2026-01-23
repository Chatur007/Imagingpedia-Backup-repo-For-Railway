-- Database Schema for AI LMS Test System
-- Execute these SQL commands in your PostgreSQL database

-- 1. Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    subject_name VARCHAR(20) NOT NULL
);

-- 2. Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL,
    question_image TEXT NOT NULL,
    model_answer TEXT NOT NULL,
    max_marks INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- 3. Create student table (note: singular 'student')
CREATE TABLE IF NOT EXISTS student (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(20) NOT NULL,
    subject_id INTEGER NOT NULL,
    email VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- 4. Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer TEXT NOT NULL,
    ai_score NUMERIC(5,2),
    lost_marks TEXT,
    improvements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Sample data for testing
-- Insert sample subjects
INSERT INTO subjects (subject_name) VALUES
    ('Radiology'),
    ('Cardiology'),
    ('Neurology'),
    ('Orthopedics')
ON CONFLICT DO NOTHING;

-- Insert sample questions (replace URLs with actual image URLs)
INSERT INTO questions (subject_id, question_image, model_answer, max_marks) VALUES
    (1, 'https://radiologybusiness.com/sites/default/files/2022-09/Breast%20MRI%20invasive%20ductal%20carcinoma_Computer-aided_volumetry_images_pre%20and%20post%20chemo_partial_response_RSNA.jpg', 
     'The chest X-ray shows a large area of increased opacity in the right lower lobe, consistent with pneumonia. There is an air bronchogram visible, and the right costophrenic angle appears blunted, suggesting possible pleural effusion. The cardiac silhouette is normal in size.', 
     10),
    (1, 'https://images.fineartamerica.com/images-medium-large/2-breast-implants-x-ray-.jpg', 
     'The CT scan demonstrates a hypodense area in the left middle cerebral artery territory, consistent with an acute ischemic stroke. The lateral ventricles appear slightly dilated. The gray-white matter differentiation is preserved on the right side but diminished on the affected left side. No evidence of hemorrhage is present.', 
     10),
    (2, 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=800&h=600&fit=crop', 
     'The echocardiogram shows all four cardiac chambers. The left ventricle appears dilated with reduced wall motion, suggesting systolic dysfunction. The left atrium is also enlarged. There is moderate mitral regurgitation visible on color Doppler. The right heart chambers appear normal in size. The estimated ejection fraction is reduced at approximately 35-40%.', 
     10),
    (3, 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop', 
     'The brain MRI T2-weighted sequence shows multiple hyperintense periventricular white matter lesions in a perpendicular orientation to the ventricles (Dawson''s fingers), consistent with multiple sclerosis. The lesions are scattered throughout both hemispheres. No mass effect or midline shift is present. The corpus callosum shows involvement.', 
     10),
    (4, 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&h=600&fit=crop', 
     'The knee MRI demonstrates a vertical tear of the posterior horn of the medial meniscus extending to the articular surface. The anterior cruciate ligament (ACL) shows abnormal signal intensity and loss of normal fiber pattern, consistent with a complete tear. The posterior cruciate ligament and collateral ligaments appear intact. There is a moderate joint effusion and bone marrow edema in the lateral tibial plateau.', 
     10)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_subject_id ON student(subject_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_question_id ON submissions(question_id);

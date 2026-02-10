-- Database Schema for Courses Management System
-- Execute these SQL commands in your PostgreSQL database

-- 0. Create admins table (for admin authentication)
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1. Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    course_description TEXT NOT NULL,
    course_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create course_videos table (for YouTube videos)
CREATE TABLE IF NOT EXISTS course_videos (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    video_title VARCHAR(255) NOT NULL,
    video_url TEXT NOT NULL,
    video_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 3. Create course_images table (for additional course images/resources)
CREATE TABLE IF NOT EXISTS course_images (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    image_title VARCHAR(255),
    image_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Sample data for testing
INSERT INTO courses (course_name, course_description, course_image) VALUES
    ('Radiology Fundamentals', 'Learn the basics of radiological imaging techniques and interpretation', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop'),
    ('Cardiology Essentials', 'Understanding cardiac anatomy, physiology, and common pathologies', 'https://images.unsplash.com/photo-1631217314989-5e6ab0469fba?w=800&h=600&fit=crop'),
    ('Neurology Advanced', 'Advanced concepts in neurological diagnosis and treatment', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop'),
    ('Orthopedics Mastery', 'Master musculoskeletal imaging and orthopedic procedures', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop')
ON CONFLICT DO NOTHING;

-- Sample course videos
INSERT INTO course_videos (course_id, video_title, video_url, video_order) VALUES
    (1, 'Chest X-ray Basics', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1),
    (1, 'CT Scan Interpretation', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2),
    (2, 'Echocardiography Overview', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1),
    (2, 'Cardiac Pathologies', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2)
ON CONFLICT DO NOTHING;

-- Sample course images
INSERT INTO course_images (course_id, image_url, image_title, image_order) VALUES
    (1, 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop', 'Radiology Equipment', 1),
    (1, 'https://images.unsplash.com/photo-1631217314989-5e6ab0469fba?w=400&h=300&fit=crop', 'X-ray Examples', 2),
    (2, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop', 'Heart Anatomy', 1),
    (2, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop', 'ECG Readings', 2)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);
CREATE INDEX IF NOT EXISTS idx_course_videos_course_id ON course_videos(course_id);
CREATE INDEX IF NOT EXISTS idx_course_images_course_id ON course_images(course_id);

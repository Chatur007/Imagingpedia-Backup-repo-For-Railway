# Admin Authentication System Setup Guide

## Overview
This guide explains the new admin authentication system for Imagingpedia. Admins can now log in with a username and password through a dedicated admin login page.

## What's New

### 1. Database Changes
- **New Admin Table**: Created a `admins` table to store admin credentials securely
- Location: `src/Backed for AI Test/COURSES_DATABASE_SCHEMA.sql`

### 2. Backend Changes
- **New Admin Routes**: Created `/admin` route with login and verification endpoints
- Location: `src/Backed for AI Test/ai-lms-backend/routes/admin.js`
- Endpoints:
  - `POST /admin/login` - Admin login with username and password
  - `POST /admin/verify` - Verify JWT token
  - `POST /admin/logout` - Logout endpoint

### 3. Frontend Changes
- **AdminLogin Page**: New dedicated login page for admins
- **AdminDashboard Page**: Dashboard showing options to manage courses or questions
- **UpdatedApp Routing**: Added new routes for admin login and dashboard
- **RequireAdminAuth Component**: Protects admin routes from unauthorized access

## Setup Instructions

### Step 1: Install Backend Dependencies
```bash
cd "src/Backed for AI Test/ai-lms-backend"
npm install bcrypt jsonwebtoken
```

### Step 2: Update Database
Run the migration script to create the admin table:
```bash
node migrate_add_admin_table.js
```

Alternatively, execute the SQL from `COURSES_DATABASE_SCHEMA.sql`:
```sql
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 3: Default Admin Credentials
After running the migration, a default admin user is created:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change these credentials in production!

### Step 4: Configure Environment Variables
Add the following to your `.env` file in the backend directory:
```
JWT_SECRET=your-secret-key-change-in-production
DATABASE_URL=your-database-url
```

## User Flow

1. **Admin Login**
   - Visit `/admin/login`
   - Enter username and password
   - Get JWT token (stored in localStorage)

2. **Admin Dashboard**
   - After successful login, redirected to `/admin/dashboard`
   - Shows two options:
     - "Manage Courses" → `/admin/courses`
     - "Manage Questions" → `/admin/questions`

3. **Admin Logout**
   - Click "Logout" from dashboard or admin pages
   - JWT token removed from localStorage
   - Redirected to login page

## Pages Overview

### AdminLogin (`src/pages/AdminLogin.tsx`)
- Clean, professional login interface
- Username and password input fields
- Shows demo credentials for testing
- Validates credentials against backend API

### AdminDashboard (`src/pages/AdminDashboard.tsx`)
- Welcome message with admin username
- Two main action cards:
  - Manage Courses
  - Manage Questions
- Logout button
- Protected route (requires valid JWT token)

### AdminCourses & AdminQuestions (Updated)
- Removed hardcoded password checks
- Now verify JWT token in localStorage
- Redirect to admin login if not authenticated
- Logout functionality integrated

## Authentication Flow

```
┌─────────────┐
│ Admin Login │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────┐
│ POST /admin/login                │
│ {username, password}             │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Verify credentials       │
│ Hash password check      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Generate JWT token       │
│ (valid for 7 days)       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Store in localStorage    │
│ Redirect to dashboard    │
└──────────────────────────┘
```

## Security Notes

1. **Password Hashing**: Passwords are hashed using bcrypt with salt rounds of 10
2. **JWT Tokens**: 
   - Expire after 7 days
   - Stored in localStorage (consider secure httpOnly cookies in production)
3. **Environment Variables**: Always use strong JWT secrets in production
4. **HTTPS**: Ensure all admin communications use HTTPS in production

## File Structure

```
imagingpedia-learn/
├── src/
│   ├── pages/
│   │   ├── AdminLogin.tsx (NEW)
│   │   ├── AdminDashboard.tsx (NEW)
│   │   ├── AdminCourses.tsx (UPDATED)
│   │   └── AdminQuestions.tsx (UPDATED)
│   ├── components/
│   │   └── RequireAdminAuth.tsx (NEW)
│   └── App.tsx (UPDATED)
└── src/Backed for AI Test/ai-lms-backend/
    ├── migrate_add_admin_table.js (NEW)
    ├── routes/
    │   ├── admin.js (NEW)
    │   └── ... (other routes)
    ├── server.js (UPDATED)
    └── package.json (UPDATED)
```

## Testing

### Test Admin Login
1. Navigate to `/admin/login`
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Should redirect to `/admin/dashboard`

### Test Admin Routes
- Modify courses: `/admin/courses`
- Modify questions: `/admin/questions`
- Both should require authentication

### Create Additional Admin Users
Insert in database:
```sql
INSERT INTO admins (username, email, password) 
VALUES ('newadmin', 'admin2@example.com', '$2b$10$...');
```

## Troubleshooting

### Issue: Login fails with "Invalid username or password"
- Verify admin exists in database
- Check if password hash matches

### Issue: Token expired
- Log in again to get a new token
- Token valid for 7 days by default

### Issue: Can't access admin pages
- Ensure JWT token is in localStorage
- Check if localStorage is enabled in browser
- Verify token hasn't expired

## Future Improvements

- [ ] Add admin user management page
- [ ] Implement refresh tokens
- [ ] Add two-factor authentication
- [ ] Create audit logs for admin actions
- [ ] Add role-based access control (RBAC)
- [ ] Implement password reset functionality
- [ ] Move JWT token to secure httpOnly cookies

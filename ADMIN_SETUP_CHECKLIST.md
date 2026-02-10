# Admin Authentication Implementation Checklist

## Backend Setup ✓

### Dependencies Installed
- [x] bcrypt (password hashing)
- [x] jsonwebtoken (JWT token generation)

**Action Required:**
```bash
cd "src/Backed for AI Test/ai-lms-backend"
npm install
```

### Database Setup
- [x] Admin table schema created in `COURSES_DATABASE_SCHEMA.sql`
- [x] Migration script created: `migrate_add_admin_table.js`

**Action Required:**
1. Run migration: `node migrate_add_admin_table.js`
2. Or manually execute SQL from updated COURSES_DATABASE_SCHEMA.sql

### Backend Routes
- [x] New admin routes file: `routes/admin.js`
- [x] Server updated to include admin routes: `server.js`

**Routes Created:**
- `POST /admin/login` - Login with username/password → Returns JWT token
- `POST /admin/verify` - Verify JWT token validity
- `POST /admin/logout` - Logout endpoint

## Frontend Setup ✓

### New Pages Created
- [x] `src/pages/AdminLogin.tsx` - Login page with demo credentials
- [x] `src/pages/AdminDashboard.tsx` - Dashboard showing course & question management options

### Components Created
- [x] `src/components/RequireAdminAuth.tsx` - Protected route component

### Routes Updated
- [x] `src/App.tsx` - Added 4 new routes:
  - `/admin/login` → AdminLogin page
  - `/admin/dashboard` → Protected AdminDashboard
  - `/admin/courses` → Protected AdminCourses
  - `/admin/questions` → Protected AdminQuestions

### Navigation Updated
- [x] `src/components/layout/Navbar.tsx` - Added "Admin" link to navigation

### Existing Pages Updated
- [x] `src/pages/AdminCourses.tsx` - Removed password checking, added JWT authentication
- [x] `src/pages/AdminQuestions.tsx` - Removed password checking, added JWT authentication

## Default Credentials

**Created during migration:**
- Username: `admin`
- Password: `admin123`

⚠️ **PRODUCTION SECURITY:** Change these credentials immediately in production!

## Environment Variables

Add to backend `.env` file:
```
JWT_SECRET=your-secret-key-change-in-production
DATABASE_URL=your_database_url
PORT=3000
```

## Testing Checklist

### Login Flow
- [ ] Navigate to `/admin/login`
- [ ] See login form with username/password fields
- [ ] See demo credentials displayed
- [ ] Enter `admin` / `admin123`
- [ ] Get redirected to `/admin/dashboard`
- [ ] See welcome message with admin name

### Dashboard
- [ ] See "Manage Courses" card
- [ ] See "Manage Questions" card
- [ ] See logout button
- [ ] Both cards are clickable links

### Course Management
- [ ] Click "Manage Courses" from dashboard
- [ ] Redirect to `/admin/courses`
- [ ] See course management interface (no password prompt)
- [ ] Logout button works and redirects to login

### Question Management
- [ ] Click "Manage Questions" from dashboard
- [ ] Redirect to `/admin/questions`
- [ ] See question management interface (no password prompt)
- [ ] Logout button works and redirects to login

### Authentication Protection
- [ ] Try accessing `/admin/dashboard` without login → Redirect to `/admin/login`
- [ ] Try accessing `/admin/courses` without login → Redirect to `/admin/login`
- [ ] Try accessing `/admin/questions` without login → Redirect to `/admin/login`
- [ ] Clear localStorage and refresh → Get redirected to login

### Logout Flow
- [ ] Click logout from dashboard → Redirect to `/admin/login`
- [ ] localStorage should be cleared of adminToken and admin data
- [ ] Trying to access protected routes → Redirect to login

## Storage Locations

### Frontend
```
localStorage:
- adminToken: JWT token string
- admin: JSON object with {id, username, email}
```

### Backend
```
Database table: admins
Columns: id, username, password (hashed), email, created_at, updated_at
```

## Files Modified/Created Summary

### Created Files (6)
1. `AdminLogin.tsx` - Admin login page
2. `AdminDashboard.tsx` - Admin dashboard
3. `RequireAdminAuth.tsx` - Protected route component
4. `admin.js` (routes) - Admin API endpoints
5. `migrate_add_admin_table.js` - Database migration
6. `ADMIN_AUTHENTICATION_SETUP.md` - Setup documentation

### Modified Files (6)
1. `App.tsx` - Added admin routes
2. `Navbar.tsx` - Added admin login link
3. `AdminCourses.tsx` - Updated authentication
4. `AdminQuestions.tsx` - Updated authentication
5. `server.js` - Added admin routes
6. `package.json` - Added dependencies
7. `COURSES_DATABASE_SCHEMA.sql` - Added admin table

## Deployment Notes

### Before Going to Production
1. [ ] Change default admin credentials
2. [ ] Set strong JWT_SECRET in environment
3. [ ] Use HTTPS for all admin communications
4. [ ] Consider implementing refresh tokens
5. [ ] Add audit logging for admin actions
6. [ ] Move JWT to secure httpOnly cookies
7. [ ] Implement rate limiting on login
8. [ ] Add admin user management interface

### Database Migrations
- Run `migrate_add_admin_table.js` on production database
- Or execute the CREATE TABLE statement from updated schema

## Support Commands

### Test Database Connection
```bash
node -e "require('./db.js').pool.query('SELECT NOW()').then(res => console.log(res.rows[0]))"
```

### Reset Admin Password (if needed)
```bash
node -e "
const bcrypt = require('bcrypt');
const { pool } = require('./db.js');
const hash = bcrypt.hashSync('newpassword', 10);
pool.query('UPDATE admins SET password = \$1 WHERE username = \$2', [hash, 'admin']).then(() => {
  console.log('Password updated');
  process.exit(0);
});
"
```

### Create New Admin User
```bash
node -e "
const bcrypt = require('bcrypt');
const { pool } = require('./db.js');
const hash = bcrypt.hashSync('password123', 10);
pool.query('INSERT INTO admins (username, email, password) VALUES (\$1, \$2, \$3)', ['newadmin', 'new@example.com', hash]).then(() => {
  console.log('Admin user created');
  process.exit(0);
});
"
```

## Quick Start Summary

1. **Install dependencies**
   ```bash
   cd "src/Backed for AI Test/ai-lms-backend"
   npm install
   ```

2. **Run database migration**
   ```bash
   node migrate_add_admin_table.js
   ```

3. **Set environment variables** (in .env)
   ```
   JWT_SECRET=your-secret-key
   ```

4. **Test login**
   - Go to `/admin/login`
   - Username: `admin`
   - Password: `admin123`

5. **Change default credentials immediately!**

Done! ✓

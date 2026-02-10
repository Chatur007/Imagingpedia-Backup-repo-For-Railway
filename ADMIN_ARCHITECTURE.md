# Admin Authentication System - Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                             │
│                                                                      │
│  ┌──────────────┐         ┌──────────────┐      ┌──────────────┐   │
│  │ AdminLogin   │         │ AdminDashboard│      │ AdminCourses │   │
│  │ (/admin/login)│ ─────→ │ (/admin/dashboard)─→ │ (/admin/*)   │   │
│  │              │         │              │      │              │   │
│  │ • Username   │         │ • Welcome msg│      │ • Manage     │   │
│  │ • Password   │         │ • 2 Action   │      │   content    │   │
│  │ • Login btn  │         │   cards      │      │ • Logout btn │   │
│  └──────────────┘         │ • Logout btn │      └──────────────┘   │
│         │                 └──────────────┘                           │
│         │                                                            │
│    JWT Token                  ┌──────────────┐                       │
│    stored in                  │AdminQuestions│                       │
│    localStorage               │(/admin/*)    │                       │
│                               │ • Manage Q   │                       │
│                               │ • Logout btn │                       │
│                               └──────────────┘                       │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              │ HTTP Requests with JWT Token
              │
┌─────────────┴─────────────────────────────────────────────────────┐
│                      BACKEND (Express.js)                          │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Admin Routes (routes/admin.js)                          │    │
│  │                                                          │    │
│  │  POST /admin/login                                      │    │
│  │  ├─ Input: {username, password}                         │    │
│  │  ├─ Database: Query admins table                        │    │
│  │  ├─ Verify: bcrypt.compare(password, hashed)           │    │
│  │  └─ Output: {token, admin data} or error               │    │
│  │                                                          │    │
│  │  POST /admin/verify                                     │    │
│  │  ├─ Input: JWT token from header                        │    │
│  │  ├─ Verify: jwt.verify(token, secret)                   │    │
│  │  └─ Output: {admin data} or error                       │    │
│  └──────────────────────────────────────────────────────────┘    │
│                              ▲                                    │
│                              │                                    │
└──────────────────────────────┼────────────────────────────────────┘
                               │
                               │ Query/Update
                               │
┌──────────────────────────────┴────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                           │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ admins table                                               │  │
│  │                                                            │  │
│  │ id  │ username │ password (hashed)      │ email            │  │
│  ├─────┼──────────┼────────────────────────┼──────────────────┤  │
│  │ 1   │ admin    │ $2b$10$...bcrypt...   │ admin@example.com│  │
│  │ 2   │ editor   │ $2b$10$...bcrypt...   │ editor@example..│  │
│  │ ... │ ...      │ ...                    │ ...              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Indexes: idx_admins_username                                    │
└───────────────────────────────────────────────────────────────────┘
```

## Authentication Flow Diagram

```
User visits /admin/login
         │
         ▼
    ┌────────────────┐
    │  AdminLogin    │
    │  Component     │
    └────────┬───────┘
             │
    User enters:
    - Username: admin
    - Password: admin123
             │
             ▼
    ┌──────────────────────────────┐
    │ POST /admin/login            │
    │ {username, password}         │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Backend Routes/admin.js       │
    │                              │
    │ 1. Query admin by username   │
    │ 2. bcrypt.compare()          │
    │ 3. If match: Generate JWT    │
    └──────┬───────────────────────┘
           │
           ├─ Password FAIL ──→ Error Response (401)
           │                       │
           │                       ▼
           │                   User sees error
           │                   Stays on login page
           │
           └─ Password OK ───→ Success Response
                                 {token, admin}
                                 │
                                 ▼
                         Store in localStorage:
                         - adminToken: "eyJhbG..."
                         - admin: {id, username, email}
                                 │
                                 ▼
                         Redirect to /admin/dashboard
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  AdminDashboard        │
                    │  - Welcome message     │
                    │  - "Manage Courses"    │
                    │  - "Manage Questions"  │
                    │  - Logout button       │
                    └────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
            ┌─────────────────┐      ┌─────────────────┐
            │  AdminCourses   │      │ AdminQuestions  │
            │  (/admin/courses)       │  (/admin/questions)
            │  - Management UI│      │  - Management UI│
            │  - Logout btn   │      │  - Logout btn   │
            └─────────────────┘      └─────────────────┘
```

## Protected Route Flow

```
User tries to access /admin/dashboard
         │
         ▼
┌─────────────────────────┐
│  RequireAdminAuth       │
│  Component (Wrapper)    │
└────────┬────────────────┘
         │
         ▼
    Check localStorage
         │
         ├─ adminToken exists? ──→ YES ──→ Show AdminDashboard
         │                                  (User authenticated)
         │
         └─ NO ──→ Redirect to /admin/login
                   (User not authenticated)
```

## Token Lifecycle

```
1. LOGIN
   ┌─────────────────────────────────────────┐
   │ User submits credentials                │
   │ jwt.sign({id, username, email}, secret) │
   │ Token generated (7 days expiration)     │
   └────────────┬────────────────────────────┘
                │
                ▼
2. STORAGE
   ┌─────────────────────────────────────────┐
   │ localStorage.setItem('adminToken', jwt) │
   │ localStorage.setItem('admin', data)     │
   └────────────┬────────────────────────────┘
                │
                ▼
3. USAGE
   ┌─────────────────────────────────────────┐
   │ Include in Authorization header:        │
   │ Authorization: Bearer {token}           │
   │ Used to verify requests                 │
   └────────────┬────────────────────────────┘
                │
                ▼
4. VERIFICATION
   ┌─────────────────────────────────────────┐
   │ Backend: jwt.verify(token, secret)      │
   │ If valid: Process request               │
   │ If invalid/expired: Return 401          │
   └────────────┬────────────────────────────┘
                │
                ▼
5. LOGOUT
   ┌─────────────────────────────────────────┐
   │ localStorage.removeItem('adminToken')   │
   │ localStorage.removeItem('admin')        │
   │ Redirect to /admin/login                │
   └─────────────────────────────────────────┘
```

## Data Flow Example

### Login Request
```
Frontend →→ POST /admin/login
Body: {
  "username": "admin",
  "password": "admin123"
}

Backend →→ Response (Success)
Status: 200
Body: {
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}

Frontend →→ Store in localStorage
- adminToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
- admin: '{"id":1,"username":"admin","email":"admin@example.com"}'
```

### Accessing Protected Route
```
Frontend →→ GET /admin/courses (with headers)
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Backend →→ Verify token
1. Extract token from Authorization header
2. Call jwt.verify(token, secret)
3. If valid: Continue processing
4. If invalid: Return 401 Unauthorized

Frontend ←← Response
If authenticated: Course data
If not: Error message
```

## Security Layers

```
Layer 1: Password Security
└─ bcrypt hashing with salt rounds of 10
└─ Passwords never stored in plain text
└─ Each password hash is unique

Layer 2: Token Security
└─ JWT tokens with expiration (7 days)
└─ Signed with secret key
└─ Verified on every protected route

Layer 3: Route Protection
└─ RequireAdminAuth wrapper component
└─ localStorage check before rendering
└─ Server-side token verification

Layer 4: Database Security
└─ SQL prepared statements (via pg library)
└─ UNIQUE constraint on username
└─ Indexed username for fast lookup
```

## Error Scenarios

```
Scenario 1: Invalid Credentials
┌──────────────────────┐
│ User enters: admin   │
│ Password: wrongpwd   │
└──────┬───────────────┘
       │
       ▼
   Backend finds user BUT
   bcrypt.compare() returns false
       │
       ▼
   409 Unauthorized response
   Message: "Invalid username or password"
       │
       ▼
   Frontend shows toast error
   User stays on login page

Scenario 2: User Doesn't Exist
┌──────────────────────┐
│ User enters: unknown │
│ Password: anything   │
└──────┬───────────────┘
       │
       ▼
   Backend query returns empty
   No user found
       │
       ▼
   401 Unauthorized response
   Message: "Invalid username or password"
       │
       ▼
   Frontend shows toast error
   User stays on login page

Scenario 3: Token Expired
┌──────────────────────┐
│ User has old token   │
│ (older than 7 days)  │
└──────┬───────────────┘
       │
       ▼
   Tries to access protected route
   Token verification fails
       │
       ▼
   Redirect to /admin/login
   User must log in again
```

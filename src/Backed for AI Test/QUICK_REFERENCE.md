# Quick Reference: Subject Categories API

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/subjects` | Get all subjects (flat list) |
| `GET` | `/subjects?includeHierarchy=true` | Get all subjects with parent names |
| `GET` | `/subjects/parents` | Get only parent subjects (main categories) |
| `GET` | `/subjects/:id` | Get subject with children |
| `GET` | `/subjects/parent/:parentId/children` | Get subcategories for a parent |
| `POST` | `/subjects` | Create a new subject |
| `PUT` | `/subjects/:id` | Update a subject |
| `DELETE` | `/subjects/:id` | Delete a subject |

## Quick Commands

### 1. Run Migration (First Time Setup)
```bash
cd "src/Backed for AI Test/ai-lms-backend"
node migrate_add_subject_categories.js
```

### 2. Populate All Subjects
```bash
node populate_subjects.js
```

### 3. Create a Parent Subject
```bash
curl -X POST http://localhost:5000/subjects \
  -H "Content-Type: application/json" \
  -d '{
    "subject_name": "FRCR",
    "subject_description": "Fellowship of the Royal College of Radiologists",
    "display_order": 1
  }'
```

### 4. Create a Subcategory
```bash
curl -X POST http://localhost:5000/subjects \
  -H "Content-Type: application/json" \
  -d '{
    "subject_name": "Short Cases",
    "subject_description": "FRCR Short Case Examinations",
    "parent_id": 1,
    "display_order": 1
  }'
```

### 5. Get All Parent Subjects
```bash
curl http://localhost:5000/subjects/parents
```

### 6. Get Subject with Children
```bash
curl http://localhost:5000/subjects/1
```

## Database Schema

```sql
subjects
├── id (SERIAL PRIMARY KEY)
├── subject_name (VARCHAR)
├── subject_description (TEXT) [NEW]
├── parent_id (INTEGER) [NEW] → references subjects(id)
└── display_order (INTEGER) [NEW]
```

## Subject Structure

```
1. FRCR
   ├── 1.1 FRCR - Short Cases
   ├── 1.2 FRCR - Long Cases
   └── 1.3 FRCR - Viva

2. EBIR Mock Exam (standalone)

3. Breast Imaging Assessment (standalone)

4. Chest X-Ray Timed Set (standalone)

5. Emergency X-Ray Challenge (standalone)

6. Radiology Anatomy (standalone)

7. Interventional Radiology Viva Prep (standalone)
```

## JSON Examples

### Parent Subject Response
```json
{
  "id": 1,
  "subject_name": "FRCR",
  "subject_description": "Fellowship of the Royal College of Radiologists",
  "parent_id": null,
  "display_order": 1,
  "children": [
    {
      "id": 2,
      "subject_name": "FRCR - Short Cases",
      "parent_id": 1,
      "display_order": 1
    }
  ]
}
```

### Subcategory Response
```json
{
  "id": 2,
  "subject_name": "FRCR - Short Cases",
  "subject_description": "FRCR Short Case Examinations",
  "parent_id": 1,
  "parent_name": "FRCR",
  "display_order": 1
}
```

## Common Tasks

### Check if Migration is Needed
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'subjects' 
AND column_name IN ('parent_id', 'subject_description', 'display_order');
```

If you see all three columns, migration is complete.

### View Hierarchical Structure
```sql
SELECT 
  s.id,
  COALESCE(p.subject_name || ' - ', '') || s.subject_name as full_name,
  s.display_order
FROM subjects s
LEFT JOIN subjects p ON s.parent_id = p.id
ORDER BY COALESCE(p.display_order, s.display_order), s.display_order;
```

### Count Questions per Subject
```sql
SELECT 
  s.subject_name,
  COUNT(q.id) as question_count
FROM subjects s
LEFT JOIN questions q ON s.id = q.subject_id
GROUP BY s.id, s.subject_name
ORDER BY question_count DESC;
```

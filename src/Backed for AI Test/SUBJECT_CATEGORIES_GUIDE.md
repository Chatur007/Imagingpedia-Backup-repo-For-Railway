# Subject Categories Implementation Guide

## Overview
This guide explains how to implement hierarchical subjects with parent-child relationships (e.g., FRCR as parent with Short Cases, Long Cases, Viva as subcategories).

## Features
- ✅ Hierarchical subject structure (parent subjects with subcategories)
- ✅ Standalone subjects (no parent required)
- ✅ Custom ordering with `display_order` field
- ✅ Subject descriptions
- ✅ Cascading deletes (deleting a parent deletes all children)

## Database Schema Changes

### New Columns Added to `subjects` Table:
- `parent_id` (INTEGER): References the parent subject ID (NULL for top-level subjects)
- `subject_description` (TEXT): Optional description of the subject
- `display_order` (INTEGER): For custom ordering (default: 0)

## Step-by-Step Setup

### 1. Run the Migration

Execute the migration script to add new columns:

```bash
# Navigate to the backend directory
cd "src/Backed for AI Test/ai-lms-backend"

# Run the migration
node migrate_add_subject_categories.js
```

Alternatively, run the SQL directly in your PostgreSQL database:

```bash
psql -d your_database_name -f ../SUBJECT_CATEGORIES_SCHEMA.sql
```

### 2. Create Your Subject Structure

#### Example 1: Creating FRCR with Subcategories

**Step 1:** Create the parent subject (FRCR)
```bash
curl -X POST http://localhost:5000/subjects \
  -H "Content-Type: application/json" \
  -d '{
    "subject_name": "FRCR",
    "subject_description": "Fellowship of the Royal College of Radiologists",
    "display_order": 1
  }'
```

Response:
```json
{
  "id": 1,
  "subject_name": "FRCR",
  "subject_description": "Fellowship of the Royal College of Radiologists",
  "parent_id": null,
  "display_order": 1
}
```

**Step 2:** Create subcategories (using parent_id from above)
```bash
# Short Cases
curl -X POST http://localhost:5000/subjects \
  -H "Content-Type: application/json" \
  -d '{
    "subject_name": "Short Cases",
    "subject_description": "FRCR Short Case Examinations",
    "parent_id": 1,
    "display_order": 1
  }'

# Long Cases
curl -X POST http://localhost:5000/subjects \
  -H "Content-Type: application/json" \
  -d '{
    "subject_name": "Long Cases",
    "subject_description": "FRCR Long Case Examinations",
    "parent_id": 1,
    "display_order": 2
  }'

# Viva
curl -X POST http://localhost:5000/subjects \
  -H "Content-Type: application/json" \
  -d '{
    "subject_name": "Viva",
    "subject_description": "FRCR Viva Voce Examinations",
    "parent_id": 1,
    "display_order": 3
  }'
```

#### Example 2: Creating Standalone Subjects

For subjects without subcategories (like EBIR Mock Exam):

```bash
curl -X POST http://localhost:5000/subjects \
  -H "Content-Type: application/json" \
  -d '{
    "subject_name": "EBIR Mock Exam",
    "subject_description": "European Board of Interventional Radiology Mock Examination",
    "display_order": 2
  }'
```

## API Endpoints

### 1. Get All Subjects (Flat List)
```
GET /subjects
```

Response:
```json
[
  {
    "id": 1,
    "subject_name": "FRCR",
    "subject_description": "Fellowship of the Royal College of Radiologists",
    "parent_id": null,
    "display_order": 1
  },
  {
    "id": 2,
    "subject_name": "Short Cases",
    "subject_description": "FRCR Short Case Examinations",
    "parent_id": 1,
    "display_order": 1
  },
  ...
]
```

### 2. Get All Subjects with Hierarchy
```
GET /subjects?includeHierarchy=true
```

Response includes parent names:
```json
[
  {
    "id": 1,
    "subject_name": "FRCR",
    "subject_description": "Fellowship of the Royal College of Radiologists",
    "parent_id": null,
    "parent_name": null,
    "display_order": 1
  },
  {
    "id": 2,
    "subject_name": "Short Cases",
    "subject_description": "FRCR Short Case Examinations",
    "parent_id": 1,
    "parent_name": "FRCR",
    "display_order": 1
  },
  ...
]
```

### 3. Get Only Parent Subjects
```
GET /subjects/parents
```

Returns only top-level subjects (where `parent_id IS NULL`).

### 4. Get Subject with Children
```
GET /subjects/:id
```

Response:
```json
{
  "id": 1,
  "subject_name": "FRCR",
  "subject_description": "Fellowship of the Royal College of Radiologists",
  "parent_id": null,
  "parent_name": null,
  "display_order": 1,
  "children": [
    {
      "id": 2,
      "subject_name": "Short Cases",
      "subject_description": "FRCR Short Case Examinations",
      "parent_id": 1,
      "display_order": 1
    },
    {
      "id": 3,
      "subject_name": "Long Cases",
      "subject_description": "FRCR Long Case Examinations",
      "parent_id": 1,
      "display_order": 2
    },
    {
      "id": 4,
      "subject_name": "Viva",
      "subject_description": "FRCR Viva Voce Examinations",
      "parent_id": 1,
      "display_order": 3
    }
  ]
}
```

### 5. Get Subcategories for a Parent
```
GET /subjects/parent/:parentId/children
```

Example: `GET /subjects/parent/1/children`

Response:
```json
{
  "parent": {
    "id": 1,
    "subject_name": "FRCR",
    "subject_description": "Fellowship of the Royal College of Radiologists",
    "parent_id": null,
    "display_order": 1
  },
  "children": [
    {
      "id": 2,
      "subject_name": "Short Cases",
      ...
    },
    {
      "id": 3,
      "subject_name": "Long Cases",
      ...
    },
    {
      "id": 4,
      "subject_name": "Viva",
      ...
    }
  ]
}
```

### 6. Create a New Subject
```
POST /subjects
Content-Type: application/json

{
  "subject_name": "Subject Name",
  "subject_description": "Optional description",
  "parent_id": null,  // or ID of parent subject for subcategories
  "display_order": 0
}
```

### 7. Update a Subject
```
PUT /subjects/:id
Content-Type: application/json

{
  "subject_name": "Updated Name",
  "subject_description": "Updated description",
  "parent_id": 1,  // Can change parent
  "display_order": 5
}
```

### 8. Delete a Subject
```
DELETE /subjects/:id
```

**Note:** Deleting a parent subject will automatically delete all its subcategories due to CASCADE constraint.

## Complete Subject Structure Example

Here's how to create all your subjects:

```javascript
// 1. FRCR and subcategories
const frcr = {
  name: "FRCR",
  description: "Fellowship of the Royal College of Radiologists",
  subcategories: [
    { name: "Short Cases", description: "FRCR Short Case Examinations" },
    { name: "Long Cases", description: "FRCR Long Case Examinations" },
    { name: "Viva", description: "FRCR Viva Voce Examinations" }
  ]
};

// 2. Standalone subjects
const standaloneSubjects = [
  { name: "EBIR Mock Exam", description: "European Board of Interventional Radiology Mock Examination" },
  { name: "Breast Imaging Assessment", description: "Comprehensive Breast Imaging Evaluation" },
  { name: "Chest X-Ray Timed Set", description: "Time-limited Chest Radiograph Interpretation" },
  { name: "Emergency X-Ray Challenge", description: "Acute Emergency Radiograph Assessment" },
  { name: "Radiology Anatomy", description: "Cross-sectional Anatomy for Radiologists" },
  { name: "Interventional Radiology Viva Prep", description: "IR Viva Preparation and Practice" }
];
```

## Frontend Implementation Tips

### Displaying Hierarchical Subjects

```typescript
// Example React component structure
interface Subject {
  id: number;
  subject_name: string;
  subject_description: string;
  parent_id: number | null;
  display_order: number;
  children?: Subject[];
}

// Fetch parent subjects with their children
const subjects = await fetch('/subjects/parents');

// For each parent, fetch children
for (const parent of subjects) {
  const response = await fetch(`/subjects/parent/${parent.id}/children`);
  parent.children = response.children;
}

// Display in a dropdown or list
subjects.map(parent => (
  <div key={parent.id}>
    <h3>{parent.subject_name}</h3>
    {parent.children?.length > 0 && (
      <ul>
        {parent.children.map(child => (
          <li key={child.id}>{child.subject_name}</li>
        ))}
      </ul>
    )}
  </div>
));
```

### Subject Selection UI

For exam selection, you might want:
- **Option 1:** Show parent with expandable subcategories
- **Option 2:** Flatten the list showing "FRCR - Short Cases", "FRCR - Long Cases", etc.
- **Option 3:** Two-level dropdown (first select parent, then subcategory)

## Database Queries

### Useful SQL Queries

```sql
-- Get all parent subjects
SELECT * FROM subjects WHERE parent_id IS NULL ORDER BY display_order;

-- Get all subcategories of FRCR
SELECT * FROM subjects 
WHERE parent_id = (SELECT id FROM subjects WHERE subject_name = 'FRCR')
ORDER BY display_order;

-- Get full hierarchy
SELECT 
  s.id,
  s.subject_name,
  s.subject_description,
  p.subject_name as parent_name,
  s.display_order
FROM subjects s
LEFT JOIN subjects p ON s.parent_id = p.id
ORDER BY COALESCE(p.display_order, s.display_order), s.display_order;

-- Count questions per subject (including subcategories)
SELECT 
  s.subject_name,
  COUNT(q.id) as question_count
FROM subjects s
LEFT JOIN questions q ON s.id = q.subject_id
GROUP BY s.id, s.subject_name
ORDER BY s.subject_name;
```

## Migration Rollback (if needed)

If you need to revert the changes:

```sql
-- Remove the new columns
ALTER TABLE subjects DROP COLUMN IF EXISTS parent_id;
ALTER TABLE subjects DROP COLUMN IF EXISTS subject_description;
ALTER TABLE subjects DROP COLUMN IF EXISTS display_order;

-- Remove the index
DROP INDEX IF EXISTS idx_subjects_parent_id;
```

## Troubleshooting

### Issue: Migration fails
**Solution:** Check if columns already exist. The migration uses `IF NOT EXISTS` so it's safe to run multiple times.

### Issue: Cannot delete parent subject
**Solution:** The CASCADE delete should handle this. If not, manually delete children first, or check foreign key constraints.

### Issue: Subcategories not showing in order
**Solution:** Make sure to set `display_order` when creating subcategories. Lower numbers appear first.

## Next Steps

1. ✅ Run the migration
2. ✅ Create your subject structure using the API
3. ✅ Update frontend components to display hierarchical subjects
4. ✅ Test subject selection in exam creation flow
5. ✅ Add questions to specific subcategories (e.g., questions for "FRCR - Short Cases")

## Support

For questions or issues:
- Check the API responses for error messages
- Verify subjects are created with correct `parent_id` relationships
- Use the `/subjects?includeHierarchy=true` endpoint to debug the structure

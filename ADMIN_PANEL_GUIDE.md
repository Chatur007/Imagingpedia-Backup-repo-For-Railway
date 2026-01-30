# Admin Panel Setup & Usage

## Access the Admin Panel

1. Navigate to: **http://localhost:8080/admin/questions** (after frontend is running on port 5173, go to the admin page from the UI or directly navigate)

2. Enter the admin password: **`admin123`**
   - Change this in the file `src/pages/AdminQuestions.tsx` line 67 for production!

## Features

### 1. Add Questions
- Select a subject from the dropdown
- Enter the question text
- Provide a question image URL
- Enter the model/correct answer
- Set maximum marks (default: 10)
- Click "Add Question"

### 2. Edit Questions
- Click the edit icon (pencil) next to any question
- The form will populate with the question data
- Make changes and click "Update Question"
- Click "Cancel" to stop editing

### 3. Delete Questions
- Click the delete icon (trash) next to any question
- Confirm the deletion

### 4. View All Questions
- See a live list of all questions in the database
- Organized by subject
- Each card shows:
  - Subject name
  - Question text (truncated)
  - Max marks
  - Question image preview
  - Model answer preview (first 2 lines)

## Database Fields

Each question requires:
- **Subject**: Which subject this question belongs to
- **Question Text**: The question/prompt
- **Question Image URL**: Link to the medical image
- **Model Answer**: The correct/expert answer
- **Max Marks**: Points available (1-100)

## Security Notes

⚠️ **Production Security**:
- The current password is hardcoded for demo purposes
- In production, implement proper authentication:
  - Use session management
  - Add JWT tokens
  - Validate admin status on backend
  - Use HTTPS
  - Consider two-factor authentication

## Backend API Endpoints

All requests to `http://localhost:3000/questions`:

- `GET /` - Get all questions
- `GET /subject/:subjectId` - Get questions for a subject
- `GET /:id` - Get single question
- `POST /` - Create new question
- `PUT /:id` - Update question
- `DELETE /:id` - Delete question

## Troubleshooting

1. **"Invalid admin password"**: Ensure you're using `admin123`
2. **Questions not loading**: Check if backend is running on port 3000
3. **Image not showing**: Verify the image URL is valid and accessible
4. **Database errors**: Check PostgreSQL connection and ensure `questions` table exists

## Next Steps

1. Add questions for each subject
2. Test the questions on the Tests page
3. Modify the password in production
4. Implement proper admin authentication

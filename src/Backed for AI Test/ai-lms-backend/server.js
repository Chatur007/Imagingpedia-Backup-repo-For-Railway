import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import questionRoutes from "./routes/questions.js";
import submissionRoutes from "./routes/submission.js";
import studentRoutes from "./routes/students.js";
import subjectRoutes from "./routes/subjects.js";
import courseRoutes from "./routes/courses.js";
import adminRoutes from "./routes/admin.js";
import practiceQuestionsRoutes from "./routes/practiceQuestions.js";
import practiceSubjectsRoutes from "./routes/practiceSubjects.js";
import path from "path";
import fs from "fs";

const port =process.env.PORT || 3000;
const app=express();

//app.use(cors());

app.use(cors({
origin: [
"http://localhost:3000",
"http://localhost:5173",
"http://localhost:8080",
"http://localhost:8081",
"https://imagingpedia-backup-repo-for-railwa.vercel.app",
"https://imagingpedia-backup-repo-for-railway-production.up.railway.app"
],
credentials: true
}));
app.use(express.json());

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

app.use("/questions",questionRoutes);
app.use("/practice-questions", practiceQuestionsRoutes);
app.use("/practice-subjects", practiceSubjectsRoutes);
app.use("/submission",submissionRoutes);
app.use("/students",studentRoutes);
app.use("/subjects",subjectRoutes);
app.use("/courses",courseRoutes);
app.use("/admin",adminRoutes);


app.listen(port,'0.0.0.0',()=>{
    console.log(`server started at ${port}`);
});
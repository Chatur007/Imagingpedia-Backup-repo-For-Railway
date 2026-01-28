import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import questionRoutes from "./routes/questions.js";
import submissionRoutes from "./routes/submission.js";
import studentRoutes from "./routes/students.js";
import subjectRoutes from "./routes/subjects.js";

const port =process.env.PORT || 3000;
const app=express();

//app.use(cors());

app.use(cors({
origin: [
"http://localhost:3000",
"http://localhost:5173",
"http://localhost:8080",
"http://localhost:8081",
"https://imagingpedia-testing.vercel.app",
"https://imagingpedia-testing.onrender.com"
],
credentials: true
}));
app.use(express.json());

app.use("/questions",questionRoutes);
app.use("/submission",submissionRoutes);
app.use("/students",studentRoutes);
app.use("/subjects",subjectRoutes);


app.listen(port,'0.0.0.0',()=>{
    console.log(`server started at ${port}`);
});
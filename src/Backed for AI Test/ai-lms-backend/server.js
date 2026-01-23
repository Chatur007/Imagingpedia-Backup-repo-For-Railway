import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import questionRoutes from "./routes/questions.js";
import submissionRoutes from "./routes/submission.js";
import studentRoutes from "./routes/students.js";
import subjectRoutes from "./routes/subjects.js";

const port =3000;
const app=express();

app.use(cors());
app.use(express.json());

app.use("/questions",questionRoutes);
app.use("/submission",submissionRoutes);
app.use("/students",studentRoutes);
app.use("/subjects",subjectRoutes);


app.listen(port,()=>{
    console.log(`server started at ${port}`);
});
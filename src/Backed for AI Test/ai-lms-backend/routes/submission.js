import express from "express";
import{pool} from "../db.js";
import {evaluate}from "../services/aiServices.js";

const router=express.Router();

router.post("/",async(req,res)=>{
    try{
        console.log("=== SUBMISSION REQUEST ===");
        console.log("Body:", req.body);
        
        const{student_id,question_id,answer,model_answer,max_marks}=req.body;
        
        console.log("Parsed values:", { student_id, question_id, answer: answer?.substring(0, 100), model_answer: model_answer?.substring(0, 100), max_marks });

        let model, marks;
        
        if (model_answer && max_marks) {
            model = model_answer;
            marks = max_marks;
            console.log("Using model_answer and max_marks from request");
        } else {
            console.log("Fetching from database for question_id:", question_id);
            const q = await pool.query(
                "SELECT model_answer,max_marks FROM questions WHERE id=$1",[question_id]
            );
            
            if (q.rows.length === 0) {
                console.error("Question not found:", question_id);
                return res.status(404).json({error: "Question not found"});
            }
            
            model = q.rows[0].model_answer;
            marks = q.rows[0].max_marks;
            console.log("Retrieved from DB:", { model: model?.substring(0, 100), marks });
        }

        console.log("Calling AI evaluation service...");
        const ai = await evaluate(model,answer,marks);
        console.log("AI Result:", ai);

        console.log("Saving to submissions table...");
        const saved=await pool.query(
            "INSERT INTO submissions (student_id,question_id,answer,ai_score,lost_marks,improvements) VALUES($1,$2,$3,$4,$5,$6) RETURNING*",
            [student_id,question_id,answer,ai.score,ai.lost_marks,ai.improvement]
        );
        
        console.log("Saved submission:", saved.rows[0]);
        
      
        const result = {
            ...saved.rows[0],
            improvement: saved.rows[0].improvements
        };
        
        res.json(result);
    }catch(error){
        console.error("Submission error:",error.message);
        console.error("Stack:", error.stack);
        res.status(500).json({error:error.message});
    }
});

export default router;
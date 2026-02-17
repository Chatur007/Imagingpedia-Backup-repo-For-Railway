// import dotenv from "dotenv";
// dotenv.config();

// import OpenAI from "openai";

// const deepseek = new OpenAI({
//  apiKey: "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",
//  baseURL: "https://api.deepseek.com"
// });

// export async function evaluate(model, student, marks) {

//  const prompt = `
//  You are an exam evaluator.

//  Model Answer:
//  ${model}

//  Student Answer:
//  ${student}

//  Max Marks: ${marks}

//  Return JSON only:
//  {
//   "score": number,
//   "lost_marks": "Where marks lost",
//   "improvement": "How to improve"
//  }
//  `;

//  const res = await deepseek.chat.completions.create({
//    model: "deepseek/deepseek-r1-0528:free",
//    messages: [
//      { role: "user", content: prompt }
//    ],
//    stream: true
//  });

//  return JSON.parse(res.choices[0].message.content);
// }


import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function evaluate(model, student, marks) {
  try {
    console.log("=== AI EVALUATION START ===");
    console.log("Model Answer:", model?.substring(0, 100) + "...");
    console.log("Student Answer:", student?.substring(0, 100) + "...");
    console.log("Max Marks:", marks);

    const prompt = `You are an expert medical imaging radiologist evaluator. Your task is to evaluate a student's answer against a model answer.

Model Answer (Expected):
"${model}"

Student Answer (Provided):
"${student}"

Maximum Marks: ${marks}

Please evaluate the student's answer and respond with ONLY valid JSON (no markdown, no code blocks, no explanations):
{
  "score": <number from 0 to ${marks}>,
  "lost_marks": "<specific areas where marks were lost, be concise>",
  "improvement": "<concrete suggestions for better answer, be specific>"
}

Scoring Guidelines:
- Full marks if answer matches model answer closely
- Deduct marks for missing key findings, incorrect interpretations, or lack of detail
- Consider clinical accuracy and completeness
- Award partial credit for partial answers

IMPORTANT: Return ONLY the JSON object, nothing else. No markdown, no code blocks, no explanations.`;

    console.log("Sending request to OpenRouter API...");

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Imagingpedia AI Evaluation",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✓ API Response received");
    console.log("Response Status:", response.status);
    console.log("Full API Response:", JSON.stringify(response.data, null, 2));

    const messageContent = response.data.choices?.[0]?.message?.content;
    console.log("Raw Message Content Type:", typeof messageContent);
    console.log("Raw Message Content Length:", messageContent?.length || 0);
    console.log("Raw Message Content:", messageContent);

    if (!messageContent || messageContent.trim() === "" || messageContent.trim() === "null") {
      console.error("Empty or null message content from AI");
      console.error("Full response data:", response.data);
      return {
        score: Math.floor(marks / 2),
        lost_marks: "AI service returned empty response. Unable to evaluate.",
        improvement: "Please try submitting again. The AI evaluation service may be temporarily unavailable.",
      };
    }

    let cleanedContent = messageContent
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    console.log("Cleaned Content:", cleanedContent);
    console.log("Cleaned Content Length:", cleanedContent.length);

    if (!cleanedContent.startsWith("{") || !cleanedContent.endsWith("}")) {
      console.error("Content is not valid JSON format");
      console.error("Expected JSON object, got:", cleanedContent.substring(0, 100));
      return {
        score: Math.floor(marks / 2),
        lost_marks: "AI returned invalid format. Unable to parse response.",
        improvement: "Please try again or contact support.",
      };
    }

 
    let result;
    try {
      result = JSON.parse(cleanedContent);
      console.log("JSON Parsed Successfully");
      console.log("Parsed Result:", result);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      console.error("Failed to parse:", cleanedContent);
      return {
        score: Math.floor(marks / 2),
        lost_marks: "Unable to parse AI response.",
        improvement: "Please try again.",
      };
    }

    if (!result.hasOwnProperty("score") || result.score === undefined) {
      console.error("Missing 'score' field in result");
      result.score = Math.floor(marks / 2);
    }
 
    const isPerfectScore = result.score >= marks;
    
    if (!result.hasOwnProperty("lost_marks") || result.lost_marks === undefined || typeof result.lost_marks !== 'string' || result.lost_marks.trim() === '') {
      console.error("Missing or empty 'lost_marks' field in result");
      result.lost_marks = isPerfectScore 
        ? "Excellent! No marks lost. Your answer matches the model answer well." 
        : "Evaluation incomplete";
    }
    if (!result.hasOwnProperty("improvement") || result.improvement === undefined || typeof result.improvement !== 'string' || result.improvement.trim() === '') {
      console.error("Missing or empty 'improvement' field in result");
      console.error("Current improvement value:", result.improvement);
      result.improvement = isPerfectScore 
        ? "Great work! Continue to be thorough and accurate in your descriptions of medical imaging findings." 
        : "Review the model answer and identify key medical terms, findings, and anatomical details to include in your response.";
    }

    console.log("✓ Validation complete. Final Result:", result);
    console.log("=== AI EVALUATION END ===");

    return result;
  } catch (error) {
    console.error("FATAL Evaluation error:", error.message);
    console.error("Error details:", error.response?.data || error.stack);

    return {
      score: 0,
      lost_marks: "Evaluation service encountered an error. Please try again.",
      improvement: "If this error persists, please contact support.",
    };
  }
}

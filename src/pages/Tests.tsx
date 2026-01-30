import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, SubmissionResult } from "@/lib/api";
import { 
  Clock, FileQuestion, CheckCircle, XCircle, Award
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const testsData = {
  radiology: {
    id: "radiology",
    title: "Radiology Fundamentals Assessment",
    description: "Analyze radiological images and provide detailed descriptive answers based on your observations.",
    duration: "90 minutes",
    questions: [
      {
        id: 1,
        question: "Examine this chest X-ray. Describe any abnormalities you observe and provide your diagnosis.",
        image: "https://radiologybusiness.com/sites/default/files/2022-09/Breast%20MRI%20invasive%20ductal%20carcinoma_Computer-aided_volumetry_images_pre%20and%20post%20chemo_partial_response_RSNA.jpg",
        sampleAnswer: "The chest X-ray shows a large area of increased opacity in the right lower lobe, consistent with pneumonia. There is an air bronchogram visible, and the right costophrenic angle appears blunted, suggesting possible pleural effusion. The cardiac silhouette is normal in size.",
        keyPoints: ["pneumonia", "opacity", "right lower lobe", "air bronchogram", "pleural effusion"]
      },
      {
        id: 2,
        question: "Analyze this brain CT scan. What structures can you identify and are there any notable findings?",
        image: "https://images.fineartamerica.com/images-medium-large/2-breast-implants-x-ray-.jpg",
        sampleAnswer: "The CT scan demonstrates a hypodense area in the left middle cerebral artery territory, consistent with an acute ischemic stroke. The lateral ventricles appear slightly dilated. The gray-white matter differentiation is preserved on the right side but diminished on the affected left side. No evidence of hemorrhage is present.",
        keyPoints: ["hypodense", "ischemic stroke", "MCA territory", "ventricles", "gray-white differentiation"]
      },
      {
        id: 3,
        question: "Review this abdominal CT image. Identify the visible organs and describe any pathological findings.",
        image: "https://media.gettyimages.com/id/1320370674/photo/breast-mri-with-a-tumoral-lession-in-the-left-breast-axial-view.jpg?s=612x612&w=gi&k=20&c=NSJM6T6UvKal_WQsJ_YzSE8bCn3JqFypD5NCm47WZdY=",
        sampleAnswer: "The abdominal CT shows the liver, spleen, kidneys, and surrounding bowel loops. There is a well-defined hypodense lesion in the right lobe of the liver, approximately 3cm in diameter, likely representing a hepatic cyst. The spleen appears enlarged. The kidneys show normal enhancement and no hydronephrosis. Bowel loops appear normal.",
        keyPoints: ["liver", "hypodense lesion", "hepatic cyst", "splenomegaly", "kidneys", "normal enhancement"]
      },
      {
        id: 4,
        question: "Examine this skeletal X-ray. Describe the bone structure and identify any fractures or abnormalities.",
        image: "https://www.shutterstock.com/image-photo/xray-mammogram-image-breast-cancer-260nw-586821320.jpg",
        sampleAnswer: "The X-ray shows a transverse fracture of the distal radius with dorsal angulation and displacement, consistent with a Colles' fracture. There is also evidence of ulnar styloid fracture. The radiocarpal and radioulnar joints appear intact. Soft tissue swelling is evident around the fracture site.",
        keyPoints: ["transverse fracture", "distal radius", "Colles' fracture", "displacement", "ulnar styloid", "soft tissue swelling"]
      },
      {
        id: 5,
        question: "Analyze this spine MRI. Describe the vertebral alignment and any disc abnormalities.",
        image: "https://www.shutterstock.com/image-illustration/female-chest-3d-hologram-closeup-260nw-2174736547.jpg",
        sampleAnswer: "The lumbar spine MRI demonstrates a large posterior disc herniation at L4-L5 level with significant central canal stenosis. The herniated disc material is compressing the thecal sac and nerve roots. There is loss of normal disc height and signal intensity at this level, suggesting degenerative disc disease. The remaining disc levels show mild degenerative changes.",
        keyPoints: ["disc herniation", "L4-L5", "central canal stenosis", "nerve compression", "degenerative disc disease"]
      }
    ]
  },
  cardiology: {
    id: "cardiology",
    title: "Cardiology Imaging Assessment",
    description: "Evaluate cardiac imaging studies and provide comprehensive interpretations.",
    duration: "75 minutes",
    questions: [
      {
        id: 1,
        question: "Examine this echocardiogram image. Describe the cardiac chambers and any abnormalities.",
        image: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=800&h=600&fit=crop",
        sampleAnswer: "The echocardiogram shows all four cardiac chambers. The left ventricle appears dilated with reduced wall motion, suggesting systolic dysfunction. The left atrium is also enlarged. There is moderate mitral regurgitation visible on color Doppler. The right heart chambers appear normal in size. The estimated ejection fraction is reduced at approximately 35-40%.",
        keyPoints: ["left ventricle", "dilated", "systolic dysfunction", "left atrium", "mitral regurgitation", "reduced ejection fraction"]
      },
      {
        id: 2,
        question: "Analyze this coronary angiogram. Identify the vessels and any stenotic lesions.",
        image: "https://images.unsplash.com/photo-1579154392429-0e6b4e850ad2?w=800&h=600&fit=crop",
        sampleAnswer: "The coronary angiogram demonstrates the left anterior descending artery with significant stenosis (approximately 80%) in the mid-segment. The left circumflex artery shows minimal disease. The right coronary artery appears patent with mild irregularities. There is evidence of collateral circulation. TIMI flow grade is reduced distal to the stenosis.",
        keyPoints: ["LAD stenosis", "80% occlusion", "mid-segment", "collateral circulation", "TIMI flow", "patent vessels"]
      },
      {
        id: 3,
        question: "Review this cardiac CT angiography. Describe the coronary anatomy and calcification.",
        image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800&h=600&fit=crop",
        sampleAnswer: "The cardiac CT shows extensive coronary artery calcification with a high calcium score. The left main coronary artery is patent but shows calcified plaques. Mixed calcified and non-calcified plaques are present in the LAD and RCA. The cardiac chambers are normal in size. No pericardial effusion is present.",
        keyPoints: ["coronary calcification", "high calcium score", "calcified plaques", "LAD", "RCA", "normal chambers"]
      }
    ]
  },
  neurology: {
    id: "neurology",
    title: "Neuroimaging Assessment",
    description: "Interpret neurological imaging studies and identify pathological findings.",
    duration: "80 minutes",
    questions: [
      {
        id: 1,
        question: "Examine this brain MRI. Identify the sequences and describe any abnormal findings.",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop",
        sampleAnswer: "The brain MRI T2-weighted sequence shows multiple hyperintense periventricular white matter lesions in a perpendicular orientation to the ventricles (Dawson's fingers), consistent with multiple sclerosis. The lesions are scattered throughout both hemispheres. No mass effect or midline shift is present. The corpus callosum shows involvement.",
        keyPoints: ["T2 hyperintense", "periventricular lesions", "Dawson's fingers", "multiple sclerosis", "corpus callosum", "white matter"]
      },
      {
        id: 2,
        question: "Analyze this head CT scan. Describe the intracranial findings and any acute pathology.",
        image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&h=600&fit=crop",
        sampleAnswer: "The non-contrast head CT demonstrates a large hyperdense acute subdural hematoma along the right cerebral convexity with significant mass effect. There is midline shift of approximately 8mm to the left. The ipsilateral lateral ventricle is compressed. No evidence of skull fracture. Urgent neurosurgical intervention is indicated.",
        keyPoints: ["subdural hematoma", "hyperdense", "acute", "mass effect", "midline shift", "compressed ventricle"]
      },
      {
        id: 3,
        question: "Review this cervical spine MRI. Describe the spinal cord and any compressive lesions.",
        image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&h=600&fit=crop",
        sampleAnswer: "The cervical spine MRI shows severe spinal canal stenosis at C5-C6 level due to a large posterior disc osteophyte complex. There is significant cord compression with abnormal T2 hyperintense signal within the cord, suggesting myelomalacia. Moderate to severe bilateral neural foraminal narrowing is present. Other levels show mild degenerative changes.",
        keyPoints: ["spinal stenosis", "C5-C6", "disc osteophyte complex", "cord compression", "myelomalacia", "foraminal narrowing"]
      }
    ]
  },
  orthopedics: {
    id: "orthopedics",
    title: "Musculoskeletal Imaging Assessment",
    description: "Evaluate MSK imaging and identify bone, joint, and soft tissue pathology.",
    duration: "70 minutes",
    questions: [
      {
        id: 1,
        question: "Examine this knee MRI. Describe the meniscal and ligamentous structures.",
        image: "https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&h=600&fit=crop",
        sampleAnswer: "The knee MRI demonstrates a vertical tear of the posterior horn of the medial meniscus extending to the articular surface. The anterior cruciate ligament (ACL) shows abnormal signal intensity and loss of normal fiber pattern, consistent with a complete tear. The posterior cruciate ligament and collateral ligaments appear intact. There is a moderate joint effusion and bone marrow edema in the lateral tibial plateau.",
        keyPoints: ["meniscal tear", "medial meniscus", "posterior horn", "ACL tear", "joint effusion", "bone marrow edema"]
      },
      {
        id: 2,
        question: "Analyze this shoulder MRI. Identify the rotator cuff structures and any tears.",
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=600&fit=crop",
        sampleAnswer: "The shoulder MRI reveals a full-thickness tear of the supraspinatus tendon with retraction of approximately 2cm. There is associated muscle atrophy and fatty infiltration. The infraspinatus and subscapularis tendons appear intact. A moderate subacromial-subdeltoid bursal effusion is present. The glenoid labrum shows degenerative changes but no acute tear.",
        keyPoints: ["full-thickness tear", "supraspinatus", "retraction", "muscle atrophy", "fatty infiltration", "bursal effusion"]
      },
      {
        id: 3,
        question: "Review this hip X-ray. Describe the joint space and any degenerative changes.",
        image: "https://images.unsplash.com/photo-1582719366724-0a0794e30424?w=800&h=600&fit=crop",
        sampleAnswer: "The hip radiograph demonstrates severe osteoarthritis with marked narrowing of the joint space, particularly in the superior weight-bearing portion. Large osteophytes are present along the femoral head and acetabular margins. There is subchondral sclerosis and cyst formation. The femoral head shows some flattening. No acute fracture is identified.",
        keyPoints: ["osteoarthritis", "joint space narrowing", "osteophytes", "subchondral sclerosis", "cyst formation", "degenerative changes"]
      }
    ]
  }
};

const Tests = () => {
  const location = useLocation() as { state?: any };
  const navigate = useNavigate();
  const incoming = location.state?.testInfo as
    | { id: number; name: string; email: string; subjectId: number; startedAt: number }
    | undefined;

  const [selectedCourse, setSelectedCourse] = useState<string>(incoming?.subjectId?.toString() ?? "1");
  const [testAnswers, setTestAnswers] = useState<{[key: string]: {[key: number]: string}}>({});
  const [showTestResults, setShowTestResults] = useState<{[key: string]: boolean}>({});
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [aiResults, setAiResults] = useState<{[key: string]: {[key: number]: SubmissionResult}}>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [subjectName, setSubjectName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const subjectLocked = Boolean(incoming?.subjectId);

  const currentTest = testsData[selectedCourse as keyof typeof testsData];

  const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
    return url;
  };

  const subjectDurationMins = useMemo(() => {
    // Default 90 minutes for all tests
    return 90;
  }, []);

  // Fetch questions from database
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!incoming?.subjectId) return;
      
      setIsLoadingQuestions(true);
      try {
        // Fetch subject details
        const subjectRes = await fetch(`${API_BASE_URL}/subjects/${incoming.subjectId}`);
        if (subjectRes.ok) {
          const subjectData = await subjectRes.json();
          setSubjectName(subjectData.subject_name);
        }
        
        // Fetch questions
        const questionsRes = await fetch(`${API_BASE_URL}/questions/subject/${incoming.subjectId}`);
        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          setQuestions(questionsData);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    
    fetchQuestions();
  }, [incoming?.subjectId]);

  useEffect(() => {
    // Require going through StartTest to enter here
    if (!incoming?.subjectId) {
      navigate("/start-test", { replace: true });
      return;
    }
    // Timer initialization moved to when test starts
  }, [incoming?.subjectId, navigate]);

  useEffect(() => {
    if (!testStarted || remainingSec === null) return;
    if (remainingSec <= 0) {
      // Auto submit when time runs out
      setShowTestResults(prev => ({ ...prev, [selectedCourse]: true }));
      return;
    }
    const t = setInterval(() => setRemainingSec((s) => (s ?? 0) - 1), 1000);
    return () => clearInterval(t);
  }, [remainingSec, selectedCourse, testStarted]);

  // Prevent page reload during active test
  useEffect(() => {
    if (!testStarted || isTestSubmitted()) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You cannot reload the page during the test. Your progress will be lost!";
      return "You cannot reload the page during the test. Your progress will be lost!";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [testStarted, selectedCourse, showTestResults]);

  const handleAnswerChange = (courseId: string, questionId: number, answer: string) => {
    setTestAnswers(prev => ({
      ...prev,
      [courseId]: {
        ...(prev[courseId] || {}),
        [questionId]: answer
      }
    }));
  };

  const startTest = () => {
    setTestStarted(true);
    setRemainingSec(subjectDurationMins * 60);
    setCurrentQuestionIndex(0);
  };

  const submitCurrentQuestion = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswers = getCurrentAnswers();
    const userAnswer = currentAnswers[currentQuestion.id];

    if (!userAnswer || !userAnswer.trim()) {
      alert("Please provide an answer before proceeding.");
      return;
    }

    setSubmittingQuestion(true);
    try {
      const studentId = incoming?.id || Math.floor(Math.random() * 10000);
      const payload = {
        student_id: studentId,
        question_id: currentQuestion.id,
        answer: userAnswer,
        model_answer: currentQuestion.model_answer,
        max_marks: currentQuestion.max_marks,
      };

      console.log(`Submitting Question ${currentQuestion.id}:`, payload);

      const response = await fetch(`${API_BASE_URL}/submission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Question ${currentQuestion.id} Result:`, result);
        setAiResults(prev => ({
          ...prev,
          [selectedCourse]: {
            ...(prev[selectedCourse] || {}),
            [currentQuestion.id]: result
          }
        }));

        // Move to next question or finish
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          // All questions submitted
          setShowTestResults(prev => ({ ...prev, [selectedCourse]: true }));
        }
      } else {
        const text = await response.text();
        console.error(`Question ${currentQuestion.id} Error Response:`, text);
        alert("Failed to submit answer. Please try again.");
      }
    } catch (error) {
      console.error(`Failed to evaluate question ${currentQuestion.id}:`, error);
      alert("Network error. Please try again.");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const submitTest = async (courseId: string) => {
    setIsEvaluating(true);
    try {
      const currentAnswers = getCurrentAnswers();
      const results: {[key: number]: SubmissionResult} = {};

      // Use the student ID from the database (passed from StartTest)
      const studentId = incoming?.id || Math.floor(Math.random() * 10000);

      console.log("=== SUBMITTING TEST ===");
      console.log("Student ID:", studentId);
      console.log("Questions count:", questions.length);
      console.log("Current Answers:", currentAnswers);

      // Submit each answer to backend for AI evaluation
      for (const question of questions) {
        const userAnswer = currentAnswers[question.id];
        if (userAnswer && userAnswer.trim()) {
          try {
            const payload = {
              student_id: studentId,
              question_id: question.id,
              answer: userAnswer,
              model_answer: question.model_answer,
              max_marks: question.max_marks,
            };

            console.log(`Submitting Question ${question.id}:`, payload);

            const response = await fetch(`${API_BASE_URL}/submission`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            console.log(`Question ${question.id} Response Status:`, response.status);
            console.log(`Question ${question.id} Response OK:`, response.ok);

            if (!response.ok) {
              const text = await response.text();
              console.error(`Question ${question.id} Error Response:`, text);
              continue;
            }

            const result = await response.json();
            console.log(`Question ${question.id} Result:`, result);
            results[question.id] = result;
          } catch (error) {
            console.error(`Failed to evaluate question ${question.id}:`, error);
          }
        }
      }

      console.log("All Results:", results);
      setAiResults(prev => ({ ...prev, [courseId]: results }));
      setShowTestResults(prev => ({ ...prev, [courseId]: true }));
    } catch (error) {
      console.error("Test submission error:", error);
      alert("Failed to submit test. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetTest = (courseId: string) => {
    setTestAnswers(prev => {
      const updated = { ...prev };
      delete updated[courseId];
      return updated;
    });
    setShowTestResults(prev => ({ ...prev, [courseId]: false }));
    setCurrentQuestionIndex(0);
    setTestStarted(false);
    setAiResults(prev => {
      const updated = { ...prev };
      delete updated[courseId];
      return updated;
    });
  };

  const getCurrentAnswers = () => testAnswers[selectedCourse] || {};
  const isTestSubmitted = () => showTestResults[selectedCourse] || false;
  const getCurrentAiResults = () => aiResults[selectedCourse] || {};

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Helmet>
        <title>Course Tests - Imagingpedia</title>
        <meta name="description" content="Take comprehensive imaging assessments to test your knowledge" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-16">
          <section className="py-16">
            <div className="container mx-auto px-4">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Course Assessments
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Test your knowledge with image-based assessments. Analyze medical images and provide detailed interpretations.
                </p>
              </motion.div>

              {/* Course/Tabs and Timer */}
              <div className="max-w-6xl mx-auto">
                <Tabs value={selectedCourse} onValueChange={subjectLocked ? () => {} : setSelectedCourse} className="w-full">
                  {!subjectLocked && (
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
                      <TabsTrigger value="radiology">Radiology</TabsTrigger>
                      <TabsTrigger value="cardiology">Cardiology</TabsTrigger>
                      <TabsTrigger value="neurology">Neurology</TabsTrigger>
                      <TabsTrigger value="orthopedics">Orthopedics</TabsTrigger>
                    </TabsList>
                  )}

                  {subjectLocked && (
                    <div className="flex items-center justify-between glass-card p-4 mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Candidate</p>
                        <p className="font-medium text-foreground">{incoming?.name} ({incoming?.email})</p>
                        <p className="text-sm text-muted-foreground mt-1">Subject: <span className="font-medium capitalize">{subjectName}</span></p>
                      </div>
                      {remainingSec !== null && testStarted && !isTestSubmitted() && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Time Remaining</p>
                          <p className="font-display text-3xl font-bold text-foreground">{formatTime(Math.max(0, remainingSec))}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {isLoadingQuestions ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading test questions...</p>
                    </div>
                  ) : (
                    <TabsContent key={selectedCourse} value={selectedCourse} className="mt-0">
                      {/* Test Header */}
                      <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileQuestion className="text-primary" size={24} />
                          </div>
                          <div>
                            <h2 className="font-display text-3xl font-bold text-foreground">
                              {subjectName} Assessment
                            </h2>
                            <p className="text-muted-foreground mt-1">
                              Analyze medical images and provide detailed descriptive answers based on your observations.
                            </p>
                          </div>
                        </div>

                        <div className="glass-card p-6">
                          <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock size={16} />
                              <span>Duration: {subjectDurationMins} minutes</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <FileQuestion size={16} />
                              <span>{questions.length} Image Cases</span>
                            </div>
                          </div>
                          {!isTestSubmitted() && !testStarted && (
                            <div className="mt-4 p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                              <p className="text-sm text-foreground">
                                <strong>Instructions:</strong> Carefully examine each image and provide a detailed descriptive answer. 
                                Include your observations, findings, and diagnosis. Be as specific as possible.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Start Test Button */}
                      {!testStarted && !isTestSubmitted() && (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="glass-card p-8 text-center max-w-2xl">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                              <Clock className="text-primary" size={40} />
                            </div>
                            <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                              Ready to Begin?
                            </h3>
                            <p className="text-muted-foreground mb-2">
                              You are about to start a <strong>{subjectDurationMins} minutes</strong> timed assessment with <strong>{questions.length} questions</strong>.
                            </p>
                            <p className="text-muted-foreground mb-6">
                              Once you click "Start Test", the timer will begin and cannot be paused.
                            </p>
                            <Button onClick={startTest} size="lg" className="min-w-[200px]">
                              Start Test
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Test Content - One Question at a Time */}
                      {testStarted && !isTestSubmitted() && questions.length > 0 ? (
                        <div className="space-y-6">
                          {/* Progress Indicator */}
                          <div className="glass-card p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-foreground">
                                Question {currentQuestionIndex + 1} of {questions.length}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Current Question */}
                          <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="glass-card p-6"
                          >
                            <div className="flex gap-4 mb-4">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                {currentQuestionIndex + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground text-lg">
                                  Examine this medical image and provide your analysis.
                                </h4>
                              </div>
                            </div>
                            
                            {/* Image */}
                            <div className="mb-6 rounded-lg overflow-hidden border border-border/50">
                              <img 
                                src={resolveImageUrl(questions[currentQuestionIndex].question_image)} 
                                alt={`Case ${currentQuestionIndex + 1}`}
                                className="w-full h-auto object-contain bg-black"
                              />
                            </div>

                            {/* Answer Input */}
                            <div>
                              <Label htmlFor={`answer-current`} className="text-sm font-medium text-foreground mb-2 block">
                                Your Answer:
                              </Label>
                              <Textarea
                                id="answer-current"
                                placeholder="Describe your findings, observations, and diagnosis in detail..."
                                value={getCurrentAnswers()[questions[currentQuestionIndex].id] || ''}
                                onChange={(e) => handleAnswerChange(selectedCourse, questions[currentQuestionIndex].id, e.target.value)}
                                className="min-h-[150px] resize-y"
                                disabled={submittingQuestion}
                              />
                              <p className="text-xs text-muted-foreground mt-2">
                                {getCurrentAnswers()[questions[currentQuestionIndex].id]?.length || 0} characters
                              </p>
                            </div>
                          </motion.div>

                          {/* Navigation Buttons */}
                          <div className="flex justify-between items-center pt-6">
                            <Button
                              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                              variant="outline"
                              disabled={currentQuestionIndex === 0 || submittingQuestion}
                            >
                              Previous Question
                            </Button>

                            <Button
                              onClick={submitCurrentQuestion}
                              size="lg"
                              disabled={submittingQuestion || !getCurrentAnswers()[questions[currentQuestionIndex].id]?.trim()}
                              className="min-w-[200px]"
                            >
                              {submittingQuestion ? (
                                "Evaluating..."
                              ) : currentQuestionIndex < questions.length - 1 ? (
                                "Submit & Next Question"
                              ) : (
                                "Submit & Finish Test"
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {/* Test Results - Only show after submission */}
                      {isTestSubmitted() && (
                        <div className="space-y-6">
                          {/* Results Summary */}
                          <div className="glass-card p-8 text-center border-2 border-primary/50">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 bg-primary/10">
                              <CheckCircle className="text-primary" size={40} />
                            </div>
                            <h3 className="font-display text-3xl font-bold text-foreground mb-2">
                              Test Submitted Successfully!
                            </h3>
                            <p className="text-lg text-muted-foreground mb-6">
                              Your answers have been recorded. Review the sample answers below to compare your responses.
                            </p>
                            <div className="flex gap-4 justify-center">
                              <Button onClick={() => resetTest(selectedCourse)} variant="outline" size="lg">
                                Retake Test
                              </Button>
                              <Button size="lg">
                                Request Manual Review
                              </Button>
                            </div>
                          </div>

                          {/* Detailed Results */}
                          <div className="space-y-6">
                            <h3 className="font-display text-2xl font-bold text-foreground">
                              Review Your Answers
                            </h3>
                            {questions.map((question, index) => {
                              const userAnswer = getCurrentAnswers()[question.id];
                              const aiResult = getCurrentAiResults()[question.id];
                              
                              return (
                                <div
                                  key={question.id}
                                  className="glass-card p-6 border-l-4 border-primary"
                                >
                                  <div className="flex gap-4 mb-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between">
                                        <h4 className="font-semibold text-foreground text-lg mb-3">
                                          Medical Image Analysis
                                        </h4>
                                        {aiResult && (
                                          <div className="text-right ml-4">
                                            <div className="text-2xl font-bold text-primary">
                                              {aiResult.ai_score}/{question.max_marks}
                                            </div>
                                            <div className="text-xs text-muted-foreground">AI Score</div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Image */}
                                  <div className="mb-6 rounded-lg overflow-hidden border border-border/50 max-w-2xl">
                                      <img 
                                        src={resolveImageUrl(question.question_image)} 
                                        alt={`Case ${index + 1}`}
                                        className="w-full h-auto object-contain bg-black"
                                      />
                                  </div>
                                  
                                  {/* User's Answer */}
                                  <div className="mb-6">
                                    <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                      Your Answer:
                                    </h5>
                                    <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/20">
                                      <p className="text-sm text-foreground whitespace-pre-wrap">{userAnswer}</p>
                                    </div>
                                  </div>

                                  {/* AI Feedback */}
                                  {aiResult && (
                                    <div className="mb-6 space-y-4">
                                      <div className="bg-orange-500/5 p-4 rounded-lg border-l-4 border-orange-500">
                                        <h5 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-2">
                                          Areas for Improvement:
                                        </h5>
                                        <p className="text-sm text-foreground">{aiResult.lost_marks}</p>
                                      </div>
                                      <div className="bg-green-500/5 p-4 rounded-lg border-l-4 border-green-500">
                                        <h5 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                                          Suggestions:
                                        </h5>
                                        <p className="text-sm text-foreground">{aiResult.improvement}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Sample Answer */}
                                  <div className="mb-4">
                                    <h5 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                                      Sample Expert Answer:
                                    </h5>
                                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                                      <p className="text-sm text-foreground whitespace-pre-wrap">{question.model_answer}</p>
                                    </div>
                                  </div>

                                  {/* Key Points - removed since database doesn't have it */}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Tests;

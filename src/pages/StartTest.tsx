import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface Subject {
  id: number;
  subject_name: string;
  subject_description?: string;
  parent_id?: number | null;
  parent_name?: string;
  display_order?: number;
  children?: Subject[];
}

const StartTest = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [subSubjectId, setSubSubjectId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentSubjects, setParentSubjects] = useState<Subject[]>([]);
  const [subSubjects, setSubSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingSubSubjects, setIsLoadingSubSubjects] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/subjects/parents`);
        if (response.ok) {
          const data = await response.json();
          setParentSubjects(data);
        } else {
          setError("Failed to load subjects");
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError("Failed to load subjects");
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    
    fetchSubjects();
  }, []);

  
  useEffect(() => {
    const fetchSubSubjects = async () => {
      if (!subjectId) {
        setSubSubjects([]);
        setSubSubjectId(undefined);
        return;
      }

      setIsLoadingSubSubjects(true);
      try {
        const response = await fetch(`${API_BASE_URL}/subjects/parent/${subjectId}/children`);
        if (response.ok) {
          const data = await response.json();
          if (data.children && data.children.length > 0) {
            setSubSubjects(data.children);
            setSubSubjectId(undefined); 
          } else {
            setSubSubjects([]);
            setSubSubjectId(undefined);
          }
        } else {
          setSubSubjects([]);
        }
      } catch (err) {
        console.error("Error fetching sub-subjects:", err);
        setSubSubjects([]);
      } finally {
        setIsLoadingSubSubjects(false);
      }
    };

    fetchSubSubjects();
  }, [subjectId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalSubjectId = subSubjects.length > 0 
      ? subSubjectId 
      : subjectId;   
    
    if (!name.trim() || !email.trim() || !finalSubjectId) {
      setError("Please fill in all fields to begin the test.");
      return;
    }

    if (subSubjects.length > 0 && !subSubjectId) {
      setError("Please select a sub-category for this subject.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Save student to database
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: name,
          subject_id: parseInt(finalSubjectId),
          email: email,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save student information');
      }
      
      const studentData = await response.json();

      navigate("/tests", {
        replace: false,
        state: {
          testInfo: {
            id: studentData.id,
            name,
            email,
            subjectId: parseInt(finalSubjectId),
            startedAt: Date.now(),
          },
        },
      });
    } catch (err) {
      setError("Failed to save your information. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Start Test - Imagingpedia</title>
        <meta name="description" content="Begin a timed test by providing your info and choosing a subject." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-xl">
              <div className="glass-card p-6">
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">Begin Your Test</h1>
                <p className="text-muted-foreground mb-6">Enter your details and select a subject to start a timed assessment.</p>

                {/* Instructions Section */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                  <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">ℹ</span>
                    Important Test Instructions
                  </h2>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Timed Mock:</strong> Duration varies by track (FRCR Rapid Reporting, FRCR 2B, EBIR, Breast Imaging, ED X-ray)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Auto-Submit:</strong> The exam submits automatically when time expires.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Locked Track:</strong> You cannot change exam track once started.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong> Image Interpretation Required:</strong>  Questions include X-ray, CT, MRI, US, and IR cases.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong> Structured Answers:</strong> Some sections require free-text reporting.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>No Refresh:</strong> Reloading will terminate your session.</span>
                    </li>
                  </ul>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="e.g., Alex Johnson" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  
                  {/* Parent Subject Selection */}
                  <div className="space-y-2">
                    <Label>Exam Category</Label>
                    <Select value={subjectId} onValueChange={setSubjectId} disabled={isLoadingSubjects}>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingSubjects ? "Loading subjects..." : "Select exam category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {parentSubjects.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.subject_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {subjectId && parentSubjects.find(s => s.id.toString() === subjectId)?.subject_description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {parentSubjects.find(s => s.id.toString() === subjectId)?.subject_description}
                      </p>
                    )}
                  </div>

                  {/* Sub-Subject Selection (shown only if parent has children) */}
                  {subjectId && subSubjects.length > 0 && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <Label>Sub-Category</Label>
                      <Select value={subSubjectId} onValueChange={setSubSubjectId} disabled={isLoadingSubSubjects}>
                        <SelectTrigger className="border-primary/50">
                          <SelectValue placeholder={isLoadingSubSubjects ? "Loading sub-categories..." : "Select sub-category"} />
                        </SelectTrigger>
                        <SelectContent>
                          {subSubjects.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.subject_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {subSubjectId && subSubjects.find(s => s.id.toString() === subSubjectId)?.subject_description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {subSubjects.find(s => s.id.toString() === subSubjectId)?.subject_description}
                        </p>
                      )}
                    </div>
                  )}

                  {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Begin Test"}
                  </Button>
                </form>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default StartTest;

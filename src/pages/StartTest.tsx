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

interface Subject {
  id: number;
  subject_name: string;
}

const StartTest = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  // Fetch subjects from database
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('http://localhost:3000/subjects');
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subjectId) {
      setError("Please fill in all fields to begin the test.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Save student to database
      const response = await fetch('http://localhost:3000/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: name,
          subject_id: parseInt(subjectId),
          email: email,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save student information');
      }
      
      const studentData = await response.json();
      
      // Navigate to test page with student info
      navigate("/tests", {
        replace: false,
        state: {
          testInfo: {
            id: studentData.id,
            name,
            email,
            subjectId: parseInt(subjectId),
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
                      <span><strong>Timed Assessment:</strong> Each subject has a specific duration (Radiology: 90 min, Cardiology: 75 min, Neurology: 80 min, Orthopedics: 70 min)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Auto-Submit:</strong> The test will automatically submit when the timer reaches zero</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Subject Lock:</strong> Once you begin, you cannot change the selected subject</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Image Analysis:</strong> You will analyze medical images and provide detailed descriptive answers</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>No Refresh:</strong> Refreshing the page will reset your progress and timer</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Complete All Questions:</strong> Ensure you answer all questions before the timer ends</span>
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
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={subjectId} onValueChange={setSubjectId} disabled={isLoadingSubjects}>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingSubjects ? "Loading subjects..." : "Select subject"} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.subject_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Bigin Test"}
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

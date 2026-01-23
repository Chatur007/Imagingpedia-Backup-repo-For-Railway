import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit2, Lock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Question {
  id: number;
  subject_id: number;
  question_text: string;
  question_image: string;
  model_answer: string;
  max_marks: number;
}

interface Subject {
  id: number;
  subject_name: string;
}

const AdminQuestions = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    subject_id: "",
    question_text: "",
    question_image: "",
    model_answer: "",
    max_marks: "10",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  
  const ADMIN_PASSWORD = "admin123"; 

  useEffect(() => {
    const checkAdminAuth = () => {
      const isAdminAuthenticated = sessionStorage.getItem("adminAuthenticated");
      if (isAdminAuthenticated) {
        setIsAdmin(true);
        setShowPasswordInput(false);
        fetchSubjects();
        fetchQuestions();
      }
    };
    checkAdminAuth();
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowPasswordInput(false);
      sessionStorage.setItem("adminAuthenticated", "true");
      fetchSubjects();
      fetchQuestions();
    } else {
      alert("Invalid admin password!");
      setAdminPassword("");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setShowPasswordInput(true);
    setAdminPassword("");
    sessionStorage.removeItem("adminAuthenticated");
    navigate("/");
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch("http://localhost:3000/subjects");
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch("http://localhost:3000/questions");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        subject_id: parseInt(formData.subject_id),
        question_text: formData.question_text,
        question_image: formData.question_image,
        model_answer: formData.model_answer,
        max_marks: parseInt(formData.max_marks),
      };

      const url = editingId
        ? `http://localhost:3000/questions/${editingId}`
        : "http://localhost:3000/questions";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingId ? "Question updated successfully!" : "Question added successfully!");
        setFormData({
          subject_id: "",
          question_text: "",
          question_image: "",
          model_answer: "",
          max_marks: "10",
        });
        setEditingId(null);
        fetchQuestions();
      } else {
        const error = await response.text();
        alert("Error: " + error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (question: Question) => {
    setFormData({
      subject_id: question.subject_id.toString(),
      question_text: question.question_text,
      question_image: question.question_image,
      model_answer: question.model_answer,
      max_marks: question.max_marks.toString(),
    });
    setEditingId(question.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const response = await fetch(`http://localhost:3000/questions/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("Question deleted successfully!");
          fetchQuestions();
        } else {
          alert("Error deleting question");
        }
      } catch (error) {
        console.error("Error deleting question:", error);
        alert("Failed to delete question");
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      subject_id: "",
      question_text: "",
      question_image: "",
      model_answer: "",
      max_marks: "10",
    });
  };

  const getSubjectName = (subjectId: number) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.subject_name || "Unknown";
  };

  // Admin login screen
  if (showPasswordInput) {
    return (
      <>
        <Helmet>
          <title>Admin Login - Imagingpedia</title>
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Navbar />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md px-4"
          >
            <Card className="p-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-6">
                <Lock className="text-primary" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-center text-foreground mb-2">
                Admin Access
              </h2>
              <p className="text-center text-muted-foreground mb-6">
                Enter admin password to access question management
              </p>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <Label htmlFor="password" className="text-foreground">
                    Admin Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </Card>
          </motion.div>
          <Footer />
        </div>
      </>
    );
  }

  // Admin dashboard
  return (
    <>
      <Helmet>
        <title>Admin - Manage Questions - Imagingpedia</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 pb-16">
          <section className="py-16">
            <div className="container mx-auto px-4">
              {/* Header with logout */}
              <div className="flex items-center justify-between mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
                    Question Management
                  </h1>
                  <p className="text-muted-foreground">
                    Add, edit, or delete questions from the database
                  </p>
                </motion.div>
                <Button onClick={handleAdminLogout} variant="outline">
                  Logout
                </Button>
              </div>

              <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                {/* Form Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="md:col-span-1"
                >
                  <Card className="p-6 sticky top-24">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <Plus size={24} />
                      {editingId ? "Edit" : "Add"} Question
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Subject Selection */}
                      <div>
                        <Label htmlFor="subject" className="text-foreground">
                          Subject *
                        </Label>
                        <Select
                          value={formData.subject_id}
                          onValueChange={(value) =>
                            setFormData({ ...formData, subject_id: value })
                          }
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id.toString()}>
                                {subject.subject_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Question Text */}
                      <div>
                        <Label htmlFor="question" className="text-foreground">
                          Question Text *
                        </Label>
                        <Textarea
                          id="question"
                          placeholder="Enter the question..."
                          value={formData.question_text}
                          onChange={(e) =>
                            setFormData({ ...formData, question_text: e.target.value })
                          }
                          className="mt-2 min-h-[100px]"
                          required
                        />
                      </div>

                      {/* Question Image URL */}
                      <div>
                        <Label htmlFor="image" className="text-foreground">
                          Question Image URL *
                        </Label>
                        <Input
                          id="image"
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={formData.question_image}
                          onChange={(e) =>
                            setFormData({ ...formData, question_image: e.target.value })
                          }
                          className="mt-2"
                          required
                        />
                      </div>

                      {/* Model Answer */}
                      <div>
                        <Label htmlFor="answer" className="text-foreground">
                          Model Answer *
                        </Label>
                        <Textarea
                          id="answer"
                          placeholder="Enter the model/correct answer..."
                          value={formData.model_answer}
                          onChange={(e) =>
                            setFormData({ ...formData, model_answer: e.target.value })
                          }
                          className="mt-2 min-h-[100px]"
                          required
                        />
                      </div>

                      {/* Max Marks */}
                      <div>
                        <Label htmlFor="marks" className="text-foreground">
                          Max Marks *
                        </Label>
                        <Input
                          id="marks"
                          type="number"
                          min="1"
                          max="100"
                          value={formData.max_marks}
                          onChange={(e) =>
                            setFormData({ ...formData, max_marks: e.target.value })
                          }
                          className="mt-2"
                          required
                        />
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex gap-2 pt-4">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1"
                        >
                          {isLoading ? "Saving..." : editingId ? "Update" : "Add"} Question
                        </Button>
                        {editingId && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </Card>
                </motion.div>

                {/* Questions List Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="md:col-span-2"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      All Questions ({questions.length})
                    </h2>

                    {questions.length === 0 ? (
                      <Card className="p-8 text-center">
                        <p className="text-muted-foreground">
                          No questions added yet. Start by adding your first question!
                        </p>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {questions.map((question, index) => (
                          <motion.div
                            key={question.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    {getSubjectName(question.subject_id)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Max Marks: {question.max_marks}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-foreground line-clamp-2">
                                  {question.question_text}
                                </h3>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => handleEdit(question)}
                                  className="p-2 hover:bg-primary/10 rounded transition"
                                  title="Edit"
                                >
                                  <Edit2 size={18} className="text-blue-500" />
                                </button>
                                <button
                                  onClick={() => handleDelete(question.id)}
                                  className="p-2 hover:bg-red-500/10 rounded transition"
                                  title="Delete"
                                >
                                  <Trash2 size={18} className="text-red-500" />
                                </button>
                              </div>
                            </div>

                            {/* Preview */}
                            <div className="space-y-2 text-sm">
                              {question.question_image && (
                                <div className="rounded overflow-hidden border border-border/50">
                                  <img
                                    src={question.question_image}
                                    alt="Question"
                                    className="w-full h-32 object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">
                                  Model Answer:
                                </span>
                                <p className="text-foreground line-clamp-2">
                                  {question.model_answer}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdminQuestions;

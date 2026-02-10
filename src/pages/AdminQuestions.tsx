import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

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
  const [isAuthChecked, setIsAuthChecked] = useState(false);
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!selectedFile) return;
    const preview = imagePreview;
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [selectedFile, imagePreview]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        setIsAuthChecked(true);
        navigate("/admin/login", { replace: true });
        return;
      }

      // Verify token with backend
      try {
        const response = await fetch(`${API_BASE_URL}/admin/verify`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });

        if (!response.ok) {
          // Token is invalid or expired
          localStorage.removeItem("adminToken");
          localStorage.removeItem("admin");
          setIsAuthChecked(true);
          navigate("/admin/login", { replace: true });
          return;
        }

        setIsAdmin(true);
        setIsAuthChecked(true);
        fetchSubjects();
        fetchQuestions();
      } catch (error) {
        console.error("Auth verification failed:", error);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        setIsAuthChecked(true);
        navigate("/admin/login", { replace: true });
      }
    };
    checkAdminAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login", { replace: true });
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/subjects`);
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
      const res = await fetch(`${API_BASE_URL}/questions`);
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
      // If a file is selected, send multipart/form-data so backend can accept the file
      let response: Response;
      if (selectedFile) {
        const fd = new FormData();
        fd.append("file", selectedFile);
        fd.append("subject_id", formData.subject_id);
        fd.append("question_text", formData.question_text);
        fd.append("question_image", formData.question_image || "");
        fd.append("model_answer", formData.model_answer);
        fd.append("max_marks", formData.max_marks);

        const url = editingId
          ? `${API_BASE_URL}/questions/${editingId}`
          : `${API_BASE_URL}/questions`;

        const method = editingId ? "PUT" : "POST";

        response = await fetch(url, {
          method,
          body: fd,
        });
      } else {
        const payload = {
          subject_id: parseInt(formData.subject_id),
          question_text: formData.question_text,
          question_image: formData.question_image,
          model_answer: formData.model_answer,
          max_marks: parseInt(formData.max_marks),
        };

        const url = editingId
          ? `${API_BASE_URL}/questions/${editingId}`
          : `${API_BASE_URL}/questions`;

        const method = editingId ? "PUT" : "POST";

        response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        alert(editingId ? "Question updated successfully!" : "Question added successfully!");
        setFormData({
          subject_id: "",
          question_text: "",
          question_image: "",
          model_answer: "",
          max_marks: "10",
        });
        setSelectedFile(null);
        setImagePreview("");
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
    setSelectedFile(null);
    setImagePreview(resolveImageUrl(question.question_image || ""));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
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

  const handleDeleteSubject = async (id: number, subjectName: string) => {
    if (window.confirm(`Are you sure you want to delete the subject "${subjectName}"? This will also delete all questions associated with it.`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("Subject deleted successfully!");
          fetchSubjects();
          fetchQuestions();
        } else {
          const errorData = await response.json();
          alert("Error: " + (errorData.error || "Failed to delete subject"));
        }
      } catch (error) {
        console.error("Error deleting subject:", error);
        alert("Failed to delete subject");
      }
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSubjectName.trim()) {
      alert("Please enter a subject name");
      return;
    }

    setIsCreatingSubject(true);
    try {
      const response = await fetch(`${API_BASE_URL}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_name: newSubjectName }),
      });

      if (response.ok) {
        alert("Subject created successfully!");
        setNewSubjectName("");
        fetchSubjects();
      } else {
        const errorData = await response.json();
        alert("Error: " + (errorData.error || "Failed to create subject"));
      }
    } catch (error) {
      console.error("Error creating subject:", error);
      alert("Failed to create subject");
    } finally {
      setIsCreatingSubject(false);
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

  const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    // If stored as '/uploads/...' prefix with API base
    if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
    // If stored as bare filename (e.g. 'abc.png'), assume it's in uploads
    if (!url.includes("/")) return `${API_BASE_URL}/uploads/${url}`;
    // Otherwise return as-is
    return url;
  };

  // Show loading while checking authentication
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not admin after auth check, don't render (already redirected)
  if (!isAdmin) {
    return null;
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
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </div>

              <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                {/* Subjects Management Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="md:col-span-3 mb-8"
                >
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <Plus size={24} />
                      Manage Subjects
                    </h2>
                    
                    {/* Add Subject Form */}
                    <div className="mb-8 p-4 rounded-lg bg-accent/50 border border-border/50">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Add New Subject</h3>
                      <form onSubmit={handleCreateSubject} className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter subject name (e.g., Mathematics, Physics)"
                          value={newSubjectName}
                          onChange={(e) => setNewSubjectName(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="submit"
                          disabled={isCreatingSubject}
                          className="whitespace-nowrap"
                        >
                          {isCreatingSubject ? "Creating..." : "Add Subject"}
                        </Button>
                      </form>
                    </div>

                    {/* Subjects List */}
                    <h3 className="text-lg font-semibold text-foreground mb-4">Existing Subjects ({subjects.length})</h3>
                    {subjects.length === 0 ? (
                      <p className="text-muted-foreground">No subjects available. Create your first subject above!</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {subjects.map((subject) => (
                          <div
                            key={subject.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition"
                          >
                            <span className="font-medium text-foreground">{subject.subject_name}</span>
                            <button
                              onClick={() => handleDeleteSubject(subject.id, subject.subject_name)}
                              className="p-2 hover:bg-red-500/10 rounded transition"
                              title="Delete subject"
                            >
                              <Trash2 size={18} className="text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>

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

                      {/* Question Image (URL or upload) */}
                      <div>
                        <Label htmlFor="image" className="text-foreground">
                          Question Image (URL or upload)
                        </Label>
                        <Input
                          id="image"
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={formData.question_image}
                          onChange={(e) => {
                            setFormData({ ...formData, question_image: e.target.value });
                            setSelectedFile(null);
                            setImagePreview(resolveImageUrl(e.target.value));
                          }}
                          className="mt-2"
                        />

                        <div className="mt-3">
                          <Label className="text-foreground">Or upload file</Label>
                          <div className="flex items-center gap-3 mt-2">
                            <Button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Choose File
                            </Button>
                            <input
                              id="fileUpload"
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0] || null;
                                if (f) {
                                  setSelectedFile(f);
                                  const url = URL.createObjectURL(f);
                                  setImagePreview(url);
                                  setFormData({ ...formData, question_image: "" });
                                } else {
                                  setSelectedFile(null);
                                  setImagePreview("");
                                }
                              }}
                              className="sr-only"
                            />

                            <span className="text-sm text-muted-foreground">
                              {selectedFile ? selectedFile.name : formData.question_image ? "Using URL" : "No file chosen"}
                            </span>

                            {selectedFile && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setSelectedFile(null);
                                  setImagePreview("");
                                  if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>

                        {imagePreview && (
                          <div className="rounded overflow-hidden border border-border/50 mt-3">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        )}
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
                                    src={resolveImageUrl(question.question_image)}
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

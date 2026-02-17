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
  parent_id?: number | null;
  subject_description?: string;
  display_order?: number;
}

const AdminQuestions = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
  const [newSubSubjectName, setNewSubSubjectName] = useState("");
  const [newSubSubjectParentId, setNewSubSubjectParentId] = useState<string>("");
  const [newSubSubjectDescription, setNewSubSubjectDescription] = useState("");
  const [isCreatingSubSubject, setIsCreatingSubSubject] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      const adminToken = localStorage.getItem("adminToken");
      console.log("[AdminQ] Token exists:", !!adminToken, "API URL:", API_BASE_URL);
      
      if (!adminToken) {
        console.log("[AdminQ] No token, redirecting to login");
        setAuthError("No admin token found. Please log in.");
        setIsAuthChecked(true);
        setTimeout(() => navigate("/admin/login", { replace: true }), 2000);
        return;
      }

      try {
        console.log("[AdminQ] Verifying token...");
        const response = await fetch(`${API_BASE_URL}/admin/verify`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });

        console.log("[AdminQ] Verify response:", response.status);

        if (!response.ok) {
          const errorBody = await response.text();
          console.error("[AdminQ] Verify failed:", errorBody);
          localStorage.removeItem("adminToken");
          localStorage.removeItem("admin");
          setAuthError("Session expired. Please log in again.");
          setIsAuthChecked(true);
          setTimeout(() => navigate("/admin/login", { replace: true }), 2000);
          return;
        }

        console.log("[AdminQ] Auth successful");
        setIsAdmin(true);
        setAuthError(null);
        setIsAuthChecked(true);
        fetchSubjects();
        fetchQuestions();
      } catch (error) {
        console.error("[AdminQ] Auth error:", error);
        setAuthError(
          "Failed to verify session: " +
          (error instanceof Error ? error.message : "Connection error")
        );
        setIsAuthChecked(true);
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

  const handleCreateSubSubject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSubSubjectName.trim()) {
      alert("Please enter a sub-subject name");
      return;
    }

    if (!newSubSubjectParentId) {
      alert("Please select a parent subject");
      return;
    }

    setIsCreatingSubSubject(true);
    try {
      const payload = {
        subject_name: newSubSubjectName,
        subject_description: newSubSubjectDescription || null,
        parent_id: parseInt(newSubSubjectParentId),
        display_order: 0,
      };

      const response = await fetch(`${API_BASE_URL}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Sub-subject created successfully!");
        setNewSubSubjectName("");
        setNewSubSubjectDescription("");
        setNewSubSubjectParentId("");
        fetchSubjects();
      } else {
        const errorBody = await response.text();
        try {
          const errorData = JSON.parse(errorBody);
          alert("Error: " + (errorData.error || "Failed to create sub-subject"));
        } catch {
          alert("Error: " + errorBody);
        }
      }
    } catch (error) {
      console.error("Error creating sub-subject:", error);
      alert("Failed to create sub-subject");
    } finally {
      setIsCreatingSubSubject(false);
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
    if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
    if (!url.includes("/")) return `${API_BASE_URL}/uploads/${url}`;
    return url;
  };

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

  if (authError || !isAdmin) {
    return (
      <>
        <Helmet>
          <title>Admin - Access Denied - Imagingpedia</title>
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md">
            <Lock size={48} className="mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              {authError || "You do not have permission to access this page."}
            </p>
            <p className="text-sm text-muted-foreground mb-6">Redirecting to login...</p>
            <Button onClick={() => navigate("/admin/login")}>Go to Login</Button>
          </div>
        </div>
      </>
    );
  }

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

                    {/* Add Sub-Subject Form */}
                    <div className="mb-8 p-4 rounded-lg bg-blue-50/30 border border-blue-200/50 dark:bg-blue-900/20 dark:border-blue-800/50">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Add Sub-Subject Under Parent</h3>
                      <form onSubmit={handleCreateSubSubject} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Parent Subject Selection */}
                          <div>
                            <Label htmlFor="parentSubject">Select Parent Subject *</Label>
                            <Select
                              value={newSubSubjectParentId}
                              onValueChange={setNewSubSubjectParentId}
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Choose a parent subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects
                                  .filter((s) => !s.parent_id)
                                  .map((subject) => (
                                    <SelectItem
                                      key={subject.id}
                                      value={subject.id.toString()}
                                    >
                                      {subject.subject_name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Sub-Subject Name */}
                          <div>
                            <Label htmlFor="subSubjectName">Sub-Subject Name *</Label>
                            <Input
                              id="subSubjectName"
                              type="text"
                              placeholder="e.g., Short Cases, Long Cases"
                              value={newSubSubjectName}
                              onChange={(e) => setNewSubSubjectName(e.target.value)}
                              className="mt-2"
                              required
                            />
                          </div>

                          {/* Description */}
                          <div className="md:col-span-2">
                            <Label htmlFor="subSubjectDescription">Description (Optional)</Label>
                            <Textarea
                              id="subSubjectDescription"
                              placeholder="Brief description of this sub-subject"
                              value={newSubSubjectDescription}
                              onChange={(e) => setNewSubSubjectDescription(e.target.value)}
                              className="mt-2 min-h-[60px]"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={isCreatingSubSubject || !newSubSubjectParentId}
                            className="whitespace-nowrap"
                          >
                            {isCreatingSubSubject ? "Creating..." : "Create Sub-Subject"}
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* Subjects List */}
                    {subjects.length === 0 ? (
                      <p className="text-muted-foreground">No subjects available. Create your first subject above!</p>
                    ) : (
                      <>
                        {/* Parent Subjects Section */}
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold text-foreground mb-4">
                            Parent Subjects ({subjects.filter((s) => !s.parent_id).length})
                          </h3>
                          {subjects.filter((s) => !s.parent_id).length === 0 ? (
                            <p className="text-muted-foreground">No parent subjects yet.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {subjects
                                .filter((s) => !s.parent_id)
                                .map((subject) => (
                                  <div
                                    key={subject.id}
                                    className="flex flex-col p-4 rounded-lg border-2 border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-900/20 hover:shadow-md transition"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <span className="font-bold text-foreground text-sm">PARENT</span>
                                      <button
                                        onClick={() => handleDeleteSubject(subject.id, subject.subject_name)}
                                        className="p-1 hover:bg-red-500/10 rounded transition"
                                        title="Delete subject"
                                      >
                                        <Trash2 size={16} className="text-red-500" />
                                      </button>
                                    </div>
                                    <span className="font-semibold text-foreground">{subject.subject_name}</span>
                                    {subject.subject_description && (
                                      <p className="text-xs text-muted-foreground mt-2">{subject.subject_description}</p>
                                    )}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>

                        {/* Child Subjects Section */}
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-4">
                            Sub-Subjects ({subjects.filter((s) => s.parent_id).length})
                          </h3>
                          {subjects.filter((s) => s.parent_id).length === 0 ? (
                            <p className="text-muted-foreground">No sub-subjects yet. Create one using the form above.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {subjects
                                .filter((s) => s.parent_id)
                                .map((subject) => {
                                  const parentName = subjects.find((p) => p.id === subject.parent_id)?.subject_name;
                                  return (
                                    <div
                                      key={subject.id}
                                      className="flex flex-col p-4 rounded-lg border-2 border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-900/20 hover:shadow-md transition"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <span className="font-bold text-foreground text-sm">SUB</span>
                                        <button
                                          onClick={() => handleDeleteSubject(subject.id, subject.subject_name)}
                                          className="p-1 hover:bg-red-500/10 rounded transition"
                                          title="Delete subject"
                                        >
                                          <Trash2 size={16} className="text-red-500" />
                                        </button>
                                      </div>
                                      <span className="font-semibold text-foreground">{subject.subject_name}</span>
                                      {parentName && (
                                        <p className="text-xs text-muted-foreground mt-1">under: {parentName}</p>
                                      )}
                                      {subject.subject_description && (
                                        <p className="text-xs text-muted-foreground mt-2">{subject.subject_description}</p>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      </>
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

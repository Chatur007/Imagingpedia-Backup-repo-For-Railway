import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Lock, Video, Edit, Check, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface Video {
  id: number;
  course_id: number;
  video_title: string;
  video_url: string;
  video_order: number;
}

interface Course {
  id: number;
  course_name: string;
  course_description: string;
  course_image: string;
  videos?: Video[];
  video_count?: number;
  created_at: string;
}

const AdminCourses = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  
  // Course form states
  const [courseForm, setCourseForm] = useState({
    course_name: "",
    course_description: "",
    course_image: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Video form states
  const [videoForm, setVideoForm] = useState({
    video_title: "",
    video_url: "",
    video_order: "0",
  });
  const [selectedCourseForVideo, setSelectedCourseForVideo] = useState<number | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  
  // Video editing states
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);
  const [editVideoForm, setEditVideoForm] = useState({
    video_title: "",
    video_url: "",
    video_order: "0",
  });
  
  // Course editing states
  const [editCourseForm, setEditCourseForm] = useState({
    course_name: "",
    course_description: "",
    course_image: "",
  });
  const [editCourseFile, setEditCourseFile] = useState<File | null>(null);
  const [editCourseImagePreview, setEditCourseImagePreview] = useState<string>("");
  const editCourseFileInputRef = useRef<HTMLInputElement | null>(null);

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
        fetchCourses();
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

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses`);
      if (res.ok) {
        const data = await res.json();
        // Fetch videos for each course
        const coursesWithVideos = await Promise.all(
          data.map(async (course: Course) => {
            try {
              const courseRes = await fetch(`${API_BASE_URL}/courses/${course.id}`);
              if (courseRes.ok) {
                const courseData = await courseRes.json();
                return { ...course, videos: courseData.videos || [] };
              }
            } catch (error) {
              console.error(`Error fetching videos for course ${course.id}:`, error);
            }
            return course;
          })
        );
        setCourses(coursesWithVideos);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchCourseDetails = async (courseId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}`);
      if (res.ok) {
        const courseDetails = await res.json();
        // Update the course in the courses array with the detailed data
        setCourses(prevCourses =>
          prevCourses.map(course =>
            course.id === courseId ? { ...course, videos: courseDetails.videos } : course
          )
        );
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response: Response;
      
      if (selectedFile) {
        // Upload with file
        const fd = new FormData();
        fd.append("file", selectedFile);
        fd.append("course_name", courseForm.course_name);
        fd.append("course_description", courseForm.course_description);
        fd.append("course_image", courseForm.course_image || "");

        response = await fetch(`${API_BASE_URL}/courses`, {
          method: "POST",
          body: fd,
        });
      } else {
        // Upload without file (URL only)
        response = await fetch(`${API_BASE_URL}/courses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseForm),
        });
      }

      if (response.ok) {
        alert("Course created successfully!");
        setCourseForm({ course_name: "", course_description: "", course_image: "" });
        setSelectedFile(null);
        setImagePreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchCourses();
      } else {
        const errorData = await response.json();
        alert("Error: " + (errorData.error || "Failed to create course"));
      }
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (id: number, courseName: string) => {
    if (window.confirm(`Are you sure you want to delete "${courseName}"? This will delete all videos.`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("Course deleted successfully!");
          fetchCourses();
        } else {
          const errorData = await response.json();
          alert("Error: " + (errorData.error || "Failed to delete course"));
        }
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Failed to delete course");
      }
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForVideo) {
      alert("Please select a course");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${selectedCourseForVideo}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...videoForm,
          video_order: parseInt(videoForm.video_order),
        }),
      });

      if (response.ok) {
        alert("Video added successfully!");
        setVideoForm({ video_title: "", video_url: "", video_order: "0" });
        setSelectedCourseForVideo(null);
        fetchCourses();
      } else {
        const errorData = await response.json();
        alert("Error: " + (errorData.error || "Failed to add video"));
      }
    } catch (error) {
      console.error("Error adding video:", error);
      alert("Failed to add video");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVideo = async (courseId: number, videoId: number) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/videos/${videoId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("Video deleted successfully!");
          fetchCourses();
        } else {
          alert("Error deleting video");
        }
      } catch (error) {
        console.error("Error deleting video:", error);
        alert("Failed to delete video");
      }
    }
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideoId(video.id);
    setEditVideoForm({
      video_title: video.video_title,
      video_url: video.video_url,
      video_order: video.video_order.toString(),
    });
  };

  const handleUpdateVideo = async (courseId: number, videoId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/videos/${videoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editVideoForm,
          video_order: parseInt(editVideoForm.video_order),
        }),
      });

      if (response.ok) {
        alert("Video updated successfully!");
        setEditingVideoId(null);
        setEditVideoForm({ video_title: "", video_url: "", video_order: "0" });
        fetchCourses();
      } else {
        const errorData = await response.json();
        alert("Error: " + (errorData.error || "Failed to update video"));
      }
    } catch (error) {
      console.error("Error updating video:", error);
      alert("Failed to update video");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingVideoId(null);
    setEditVideoForm({ video_title: "", video_url: "", video_order: "0" });
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setEditCourseForm({
      course_name: course.course_name,
      course_description: course.course_description,
      course_image: course.course_image || "",
    });
    setEditCourseFile(null);
    setEditCourseImagePreview(resolveImageUrl(course.course_image || ""));
  };

  const handleUpdateCourse = async (courseId: number) => {
    setIsLoading(true);
    try {
      let response: Response;
      
      if (editCourseFile) {
        // Upload with file
        const fd = new FormData();
        fd.append("file", editCourseFile);
        fd.append("course_name", editCourseForm.course_name);
        fd.append("course_description", editCourseForm.course_description);
        fd.append("course_image", editCourseForm.course_image || "");

        response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
          method: "PUT",
          body: fd,
        });
      } else {
        // Upload without file (URL only)
        response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editCourseForm),
        });
      }

      if (response.ok) {
        alert("Course updated successfully!");
        setEditingCourseId(null);
        setEditCourseForm({ course_name: "", course_description: "", course_image: "" });
        setEditCourseFile(null);
        setEditCourseImagePreview("");
        fetchCourses();
      } else {
        const errorData = await response.json();
        alert("Error: " + (errorData.error || "Failed to update course"));
      }
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Failed to update course");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCourseEdit = () => {
    setEditingCourseId(null);
    setEditCourseForm({ course_name: "", course_description: "", course_image: "" });
    setEditCourseFile(null);
    setEditCourseImagePreview("");
  };

  const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
    if (!url.includes("/")) return `${API_BASE_URL}/uploads/${url}`;
    return url;
  };

  // Admin login screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

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
        <title>Admin - Manage Courses - Imagingpedia</title>
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
                    Course Management
                  </h1>
                  <p className="text-muted-foreground">
                    Create courses, add videos, and manage course content
                  </p>
                </motion.div>
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </div>

              <div className="max-w-6xl mx-auto space-y-8">
                {/* Create Course Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <Plus size={24} />
                      Create New Course
                    </h2>

                    <form onSubmit={handleCreateCourse} className="space-y-4">
                      <div>
                        <Label htmlFor="courseName" className="text-foreground">
                          Course Name *
                        </Label>
                        <Input
                          id="courseName"
                          placeholder="e.g., Advanced Radiology"
                          value={courseForm.course_name}
                          onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })}
                          className="mt-2"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="courseDesc" className="text-foreground">
                          Course Description *
                        </Label>
                        <Textarea
                          id="courseDesc"
                          placeholder="Detailed course description..."
                          value={courseForm.course_description}
                          onChange={(e) => setCourseForm({ ...courseForm, course_description: e.target.value })}
                          className="mt-2 min-h-[100px]"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="courseImage" className="text-foreground">
                          Course Image (URL or upload)
                        </Label>
                        <Input
                          id="courseImage"
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={courseForm.course_image}
                          onChange={(e) => {
                            setCourseForm({ ...courseForm, course_image: e.target.value });
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
                              variant="outline"
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
                                  setCourseForm({ ...courseForm, course_image: "" });
                                } else {
                                  setSelectedFile(null);
                                  setImagePreview("");
                                }
                              }}
                              className="sr-only"
                            />

                            <span className="text-sm text-muted-foreground">
                              {selectedFile ? selectedFile.name : courseForm.course_image ? "Using URL" : "No file chosen"}
                            </span>

                            {selectedFile && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
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

                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Creating..." : "Create Course"}
                      </Button>
                    </form>
                  </Card>
                </motion.div>

                {/* Add Video Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <Video size={24} />
                      Add Video to Course
                    </h2>

                    <form onSubmit={handleAddVideo} className="space-y-4">
                      <div>
                        <Label className="text-foreground">Select Course *</Label>
                        <select
                          value={selectedCourseForVideo || ""}
                          onChange={(e) => setSelectedCourseForVideo(e.target.value ? parseInt(e.target.value) : null)}
                          className="mt-2 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                          required
                        >
                          <option value="">Choose a course...</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.course_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="videoTitle" className="text-foreground">
                          Video Title *
                        </Label>
                        <Input
                          id="videoTitle"
                          placeholder="e.g., CT Scanning Techniques"
                          value={videoForm.video_title}
                          onChange={(e) => setVideoForm({ ...videoForm, video_title: e.target.value })}
                          className="mt-2"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="videoUrl" className="text-foreground">
                          YouTube Embed URL *
                        </Label>
                        <Input
                          id="videoUrl"
                          placeholder="https://www.youtube.com/embed/VIDEO_ID"
                          value={videoForm.video_url}
                          onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                          className="mt-2"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Format: https://www.youtube.com/embed/VIDEO_ID
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="videoOrder" className="text-foreground">
                          Video Order
                        </Label>
                        <Input
                          id="videoOrder"
                          type="number"
                          value={videoForm.video_order}
                          onChange={(e) => setVideoForm({ ...videoForm, video_order: e.target.value })}
                          className="mt-2"
                        />
                      </div>

                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Adding..." : "Add Video"}
                      </Button>
                    </form>
                  </Card>
                </motion.div>

                {/* Courses List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold text-foreground mb-6">
                      All Courses ({courses.length})
                    </h2>

                    {courses.length === 0 ? (
                      <p className="text-muted-foreground">No courses created yet. Create your first course above!</p>
                    ) : (
                      <div className="space-y-4">
                        {courses.map((course) => (
                          <motion.div
                            key={course.id}
                            className="border border-border/50 rounded-lg p-4 hover:bg-accent/50 transition"
                          >
                            {editingCourseId === course.id ? (
                              // Edit Mode for Course
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-foreground">Course Name *</Label>
                                  <Input
                                    value={editCourseForm.course_name}
                                    onChange={(e) => setEditCourseForm({ ...editCourseForm, course_name: e.target.value })}
                                    className="mt-2"
                                    placeholder="Course name"
                                  />
                                </div>
                                
                                <div>
                                  <Label className="text-foreground">Course Description *</Label>
                                  <Textarea
                                    value={editCourseForm.course_description}
                                    onChange={(e) => setEditCourseForm({ ...editCourseForm, course_description: e.target.value })}
                                    className="mt-2 min-h-[100px]"
                                    placeholder="Course description"
                                  />
                                </div>

                                <div>
                                  <Label className="text-foreground">Course Image (URL or upload)</Label>
                                  <Input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={editCourseForm.course_image}
                                    onChange={(e) => {
                                      setEditCourseForm({ ...editCourseForm, course_image: e.target.value });
                                      setEditCourseFile(null);
                                      setEditCourseImagePreview(resolveImageUrl(e.target.value));
                                    }}
                                    className="mt-2"
                                  />

                                  <div className="mt-3">
                                    <Label className="text-foreground">Or upload file</Label>
                                    <div className="flex items-center gap-3 mt-2">
                                      <Button
                                        type="button"
                                        onClick={() => editCourseFileInputRef.current?.click()}
                                        variant="outline"
                                        size="sm"
                                      >
                                        Choose File
                                      </Button>
                                      <input
                                        ref={editCourseFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const f = e.target.files?.[0] || null;
                                          if (f) {
                                            setEditCourseFile(f);
                                            const url = URL.createObjectURL(f);
                                            setEditCourseImagePreview(url);
                                            setEditCourseForm({ ...editCourseForm, course_image: "" });
                                          } else {
                                            setEditCourseFile(null);
                                            setEditCourseImagePreview("");
                                          }
                                        }}
                                        className="sr-only"
                                      />

                                      <span className="text-sm text-muted-foreground">
                                        {editCourseFile ? editCourseFile.name : editCourseForm.course_image ? "Using URL" : "No file chosen"}
                                      </span>

                                      {editCourseFile && (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setEditCourseFile(null);
                                            setEditCourseImagePreview("");
                                            if (editCourseFileInputRef.current) editCourseFileInputRef.current.value = "";
                                          }}
                                        >
                                          Remove
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  {editCourseImagePreview && (
                                    <div className="rounded overflow-hidden border border-border/50 mt-3">
                                      <img
                                        src={editCourseImagePreview}
                                        alt="Preview"
                                        className="w-full h-32 object-cover"
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleUpdateCourse(course.id)}
                                    disabled={isLoading}
                                  >
                                    <Check size={16} className="mr-2" />
                                    {isLoading ? "Saving..." : "Save Changes"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={handleCancelCourseEdit}
                                    disabled={isLoading}
                                  >
                                    <X size={16} className="mr-2" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // View Mode for Course
                              <>
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-foreground">{course.course_name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{course.course_description}</p>
                                    {course.course_image && (
                                      <div className="mt-2">
                                        <img 
                                          src={resolveImageUrl(course.course_image)} 
                                          alt={course.course_name}
                                          className="w-32 h-20 object-cover rounded border border-border/50"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditCourse(course)}
                                      className="p-2 hover:bg-blue-500/10 rounded transition"
                                      title="Edit course"
                                    >
                                      <Edit size={18} className="text-blue-500" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (expandedCourseId === course.id) {
                                          setExpandedCourseId(null);
                                        } else {
                                          setExpandedCourseId(course.id);
                                          fetchCourseDetails(course.id);
                                        }
                                      }}
                                      className="px-3 py-1 text-sm bg-primary/10 text-primary rounded hover:bg-primary/20 transition"
                                    >
                                      {expandedCourseId === course.id ? "Hide" : "Show"} Details
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCourse(course.id, course.course_name)}
                                      className="p-2 hover:bg-red-500/10 rounded transition"
                                      title="Delete course"
                                    >
                                      <Trash2 size={18} className="text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Course Stats - Only show in view mode */}
                            {editingCourseId !== course.id && (
                              <div className="flex gap-4 mb-3 text-sm">
                                <span className="text-muted-foreground">Videos: {course.video_count || 0}</span>
                              </div>
                            )}

                            {/* Expanded Details - Only show in view mode */}
                            {editingCourseId !== course.id && expandedCourseId === course.id && (
                              <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
                                {/* Videos */}
                                <div>
                                  <h4 className="font-semibold text-foreground mb-2">Videos ({course.videos?.length || 0})</h4>
                                  {course.videos && course.videos.length > 0 ? (
                                    <div className="space-y-2 ml-4">
                                      {course.videos.map((video) => (
                                        <div key={video.id} className="p-3 bg-accent/30 rounded">
                                          {editingVideoId === video.id ? (
                                            // Edit mode
                                            <div className="space-y-3">
                                              <div>
                                                <Label className="text-xs text-foreground">Video Title</Label>
                                                <Input
                                                  value={editVideoForm.video_title}
                                                  onChange={(e) => setEditVideoForm({ ...editVideoForm, video_title: e.target.value })}
                                                  className="mt-1 h-8 text-sm"
                                                  placeholder="Video title"
                                                />
                                              </div>
                                              <div>
                                                <Label className="text-xs text-foreground">Video URL</Label>
                                                <Input
                                                  value={editVideoForm.video_url}
                                                  onChange={(e) => setEditVideoForm({ ...editVideoForm, video_url: e.target.value })}
                                                  className="mt-1 h-8 text-sm"
                                                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                                                />
                                              </div>
                                              <div>
                                                <Label className="text-xs text-foreground">Order</Label>
                                                <Input
                                                  type="number"
                                                  value={editVideoForm.video_order}
                                                  onChange={(e) => setEditVideoForm({ ...editVideoForm, video_order: e.target.value })}
                                                  className="mt-1 h-8 text-sm w-24"
                                                />
                                              </div>
                                              <div className="flex gap-2">
                                                <Button
                                                  size="sm"
                                                  onClick={() => handleUpdateVideo(course.id, video.id)}
                                                  disabled={isLoading}
                                                  className="h-8"
                                                >
                                                  <Check size={14} className="mr-1" />
                                                  {isLoading ? "Saving..." : "Save"}
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={handleCancelEdit}
                                                  disabled={isLoading}
                                                  className="h-8"
                                                >
                                                  <X size={14} className="mr-1" />
                                                  Cancel
                                                </Button>
                                              </div>
                                            </div>
                                          ) : (
                                            // View mode
                                            <div className="flex items-start justify-between">
                                              <div className="flex-1">
                                                <p className="text-sm font-medium text-foreground">{video.video_title}</p>
                                                <p className="text-xs text-muted-foreground truncate">{video.video_url}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Order: {video.video_order}</p>
                                              </div>
                                              <div className="flex gap-1 ml-2">
                                                <button
                                                  onClick={() => handleEditVideo(video)}
                                                  className="p-1 hover:bg-blue-500/10 rounded transition"
                                                  title="Edit video"
                                                >
                                                  <Edit size={16} className="text-blue-500" />
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteVideo(course.id, video.id)}
                                                  className="p-1 hover:bg-red-500/10 rounded transition"
                                                  title="Delete video"
                                                >
                                                  <Trash2 size={16} className="text-red-500" />
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground ml-4">No videos added</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </Card>
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

export default AdminCourses;

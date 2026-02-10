import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, HelpCircle, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<{ username: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("admin");

    if (!adminToken || !adminData) {
      navigate("/admin/login", { replace: true });
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
    } catch (error) {
      console.error("Error parsing admin data:", error);
      navigate("/admin/login", { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/admin/login", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet >
        <title>Admin Dashboard - Imagingpedia</title>
        <meta name="description" content="Admin dashboard to manage courses and questions." />
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-display font-bold text-foreground mt-20 py-10 mb-3">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, <span className="font-semibold text-primary">{admin?.username}</span>
            </p>
          </motion.div>

          {/* Admin Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Logged in as</h2>
                  <p className="text-muted-foreground">{admin?.email}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Main Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Admin Courses Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link to="/admin/courses" className="block h-full">
                <Card className="p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full hover:border-blue-300/40 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <BookOpen className="w-7 h-7 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      MANAGER
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-display text-foreground mb-2">
                    Manage Courses
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Create, edit, and delete courses. Add course videos and manage course content.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Go to Courses
                  </Button>
                </Card>
              </Link>
            </motion.div>

            {/* Admin Questions Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link to="/admin/questions" className="block h-full">
                <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full hover:border-purple-300/40 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      <HelpCircle className="w-7 h-7 text-purple-600" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      MANAGER
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-display text-foreground mb-2">
                    Manage Questions
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Create and manage test questions. Organize questions by subject and difficulty.
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Go to Questions
                  </Button>
                </Card>
              </Link>
            </motion.div>
          </div>

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AdminDashboard;

import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  BookOpen, PlayCircle, Trophy, Clock, BarChart3, 
  ChevronRight, Bell, Settings, LogOut, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const enrolledCourses = [
  {
    id: 1,
    title: "Radiology Fundamentals",
    image: "https://images.unsplash.com/photo-1559757175-7b21671e94e0?w=400&h=250&fit=crop",
    progress: 65,
    nextLesson: "CT Imaging Principles - Lesson 3",
    lastAccessed: "2 hours ago",
  },
  {
    id: 2,
    title: "Anatomy Essentials",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=250&fit=crop",
    progress: 30,
    nextLesson: "Musculoskeletal System",
    lastAccessed: "1 day ago",
  },
];

const recentTests = [
  { title: "Radiology Quiz 1", score: 92, date: "Dec 20, 2024", status: "passed" },
  { title: "Anatomy Mid-term", score: 88, date: "Dec 18, 2024", status: "passed" },
  { title: "CT Imaging Test", score: 75, date: "Dec 15, 2024", status: "passed" },
];

const Dashboard = () => {
  const user = {
    name: "Dr. John Smith",
    email: "john.smith@hospital.com",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop",
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Imagingpedia</title>
        <meta name="description" content="Your personal learning dashboard on Imagingpedia." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Top Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass h-16 border-b border-border/50">
          <div className="h-full px-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-primary font-display font-bold">I</span>
              </div>
              <span className="font-display text-lg font-semibold text-foreground">
                Imaging<span className="text-primary">pedia</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Settings size={20} />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-primary/30"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">Student</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Welcome back, {user.name.split(" ")[0]}!
              </h1>
              <p className="text-muted-foreground">
                Continue your learning journey. You're making great progress!
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { icon: BookOpen, label: "Enrolled Courses", value: "2", color: "text-primary" },
                { icon: PlayCircle, label: "Hours Watched", value: "28", color: "text-blue-500" },
                { icon: Trophy, label: "Tests Completed", value: "5", color: "text-yellow-500" },
                { icon: BarChart3, label: "Average Score", value: "85%", color: "text-green-500" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={stat.color} size={24} />
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Enrolled Courses */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Continue Learning
                  </h2>
                  <Link to="/courses" className="text-primary hover:underline text-sm flex items-center gap-1">
                    View All <ChevronRight size={16} />
                  </Link>
                </div>

                <div className="space-y-4">
                  {enrolledCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                      className="glass-card p-4 flex flex-col sm:flex-row gap-4"
                    >
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full sm:w-40 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Next: {course.nextLesson}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Progress value={course.progress} className="h-2" />
                          </div>
                          <span className="text-sm text-muted-foreground">{course.progress}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock size={12} /> Last accessed {course.lastAccessed}
                        </p>
                      </div>
                      <Button variant="default" size="sm" asChild className="self-center">
                        <Link to={`/courses/${course.id}`}>Continue</Link>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Tests */}
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Recent Tests
                </h2>

                <div className="glass-card p-4 space-y-4">
                  {recentTests.map((test, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-foreground text-sm">{test.title}</p>
                        <p className="text-xs text-muted-foreground">{test.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${
                          test.score >= 80 ? "text-green-500" : test.score >= 60 ? "text-yellow-500" : "text-red-500"
                        }`}>
                          {test.score}%
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500 capitalize">
                          {test.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  <Button variant="outline" size="sm" className="w-full">
                    View All Results
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;

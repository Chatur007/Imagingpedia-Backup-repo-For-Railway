import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Search, Filter, Clock, BookOpen, Users, Star, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const allCourses = [
  {
    id: 1,
    title: "Radiology Fundamentals",
    description: "Master the basics of medical imaging interpretation and radiological anatomy. Perfect for beginners.",
    image: "https://images.unsplash.com/photo-1559757175-7b21671e94e0?w=800&h=500&fit=crop",
    duration: "40 hours",
    modules: 12,
    students: 1234,
    rating: 4.9,
    price: 299,
    tag: "Bestseller",
    category: "Radiology",
    level: "Beginner",
  },
  {
    id: 2,
    title: "Anatomy Essentials",
    description: "Comprehensive study of human anatomy with 3D visualizations and interactive modules.",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=500&fit=crop",
    duration: "35 hours",
    modules: 10,
    students: 987,
    rating: 4.8,
    price: 249,
    tag: "Popular",
    category: "Anatomy",
    level: "Beginner",
  },
  {
    id: 3,
    title: "Medical Imaging Advanced",
    description: "Deep dive into CT, MRI, and PET imaging techniques for diagnostic excellence.",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=500&fit=crop",
    duration: "50 hours",
    modules: 15,
    students: 756,
    rating: 4.9,
    price: 399,
    tag: "New",
    category: "Medical Imaging",
    level: "Advanced",
  },
  {
    id: 4,
    title: "Diagnostic Sciences",
    description: "Learn diagnostic methodologies and clinical decision-making processes.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=500&fit=crop",
    duration: "45 hours",
    modules: 14,
    students: 654,
    rating: 4.7,
    price: 349,
    category: "Diagnostic Sciences",
    level: "Intermediate",
  },
  {
    id: 5,
    title: "Biology for Medical Professionals",
    description: "Advanced biological concepts essential for medical practice and research.",
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=500&fit=crop",
    duration: "30 hours",
    modules: 8,
    students: 543,
    rating: 4.8,
    price: 199,
    category: "Biology",
    level: "Intermediate",
  },
  {
    id: 6,
    title: "Chest X-Ray Interpretation",
    description: "Master chest radiograph interpretation with systematic approach and case studies.",
    image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=500&fit=crop",
    duration: "25 hours",
    modules: 8,
    students: 892,
    rating: 4.9,
    price: 179,
    tag: "Featured",
    category: "Radiology",
    level: "Intermediate",
  },
];

const categories = ["All", "Radiology", "Anatomy", "Medical Imaging", "Diagnostic Sciences", "Biology"];
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "All Levels" || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <>
      <Helmet>
        <title>Courses - Imagingpedia</title>
        <meta name="description" content="Explore comprehensive medical imaging courses in radiology, anatomy, and diagnostic sciences." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24">
          {/* Header */}
          <section className="py-16 section-gradient">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Explore Our <span className="text-gradient">Courses</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Comprehensive medical education designed for healthcare professionals at every stage.
                </p>
              </motion.div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-12 px-4 pr-10 rounded-lg bg-card border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                </div>

                <div className="relative">
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="h-12 px-4 pr-10 rounded-lg bg-card border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {levels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                </div>
              </div>
            </div>
          </section>

          {/* Courses Grid */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <p className="text-muted-foreground mb-8">
                Showing {filteredCourses.length} of {allCourses.length} courses
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Link to={`/courses/${course.id}`} className="block">
                      <div className="glass-card overflow-hidden card-hover group h-full">
                        <div className="relative overflow-hidden">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                          {course.tag && (
                            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                              {course.tag}
                            </span>
                          )}
                          <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                            {course.level}
                          </span>
                        </div>

                        <div className="p-6">
                          <span className="text-xs text-primary font-medium">{course.category}</span>
                          <h3 className="font-display text-xl font-semibold text-foreground mb-2 mt-1 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {course.description}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {course.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen size={14} />
                              {course.modules} modules
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {course.students}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div className="flex items-center gap-1">
                              <Star size={16} className="text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold text-foreground">{course.rating}</span>
                            </div>
                            <div className="text-xl font-bold text-primary">${course.price}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">No courses found matching your criteria.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setSelectedLevel("All Levels");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Courses;

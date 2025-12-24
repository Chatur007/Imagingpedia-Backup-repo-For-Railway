import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { 
  Clock, BookOpen, Users, Star, Play, CheckCircle, Lock, 
  ArrowLeft, Download, Award, Globe, Shield 
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const courseData = {
  1: {
    id: 1,
    title: "Radiology Fundamentals",
    description: "Master the basics of medical imaging interpretation and radiological anatomy. This comprehensive course covers X-ray, CT, MRI, and ultrasound fundamentals with hands-on case studies.",
    image: "https://images.unsplash.com/photo-1559757175-7b21671e94e0?w=1200&h=600&fit=crop",
    duration: "40 hours",
    modules: 12,
    students: 1234,
    rating: 4.9,
    reviews: 328,
    price: 299,
    instructor: {
      name: "Dr. Michael Roberts",
      title: "Chief Radiologist, Stanford Medical",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop",
    },
    features: [
      "40+ hours of HD video content",
      "12 comprehensive modules",
      "Downloadable resources & notes",
      "Certificate of completion",
      "Lifetime access",
      "Practice exams included",
    ],
    curriculum: [
      { title: "Introduction to Radiology", lessons: 5, duration: "3h 20m", free: true },
      { title: "X-Ray Fundamentals", lessons: 8, duration: "4h 45m", free: false },
      { title: "CT Imaging Principles", lessons: 7, duration: "4h 10m", free: false },
      { title: "MRI Basics", lessons: 9, duration: "5h 30m", free: false },
      { title: "Ultrasound Techniques", lessons: 6, duration: "3h 45m", free: false },
      { title: "Chest Radiology", lessons: 8, duration: "4h 20m", free: false },
      { title: "Abdominal Imaging", lessons: 7, duration: "4h 00m", free: false },
      { title: "Musculoskeletal Radiology", lessons: 6, duration: "3h 30m", free: false },
      { title: "Neuroimaging", lessons: 8, duration: "4h 40m", free: false },
      { title: "Pediatric Radiology", lessons: 5, duration: "2h 50m", free: false },
      { title: "Emergency Radiology", lessons: 7, duration: "3h 45m", free: false },
      { title: "Final Assessment", lessons: 3, duration: "1h 30m", free: false },
    ],
  },
};

const CourseDetail = () => {
  const { id } = useParams();
  const course = courseData[Number(id) as keyof typeof courseData] || courseData[1];

  return (
    <>
      <Helmet>
        <title>{course.title} - Imagingpedia</title>
        <meta name="description" content={course.description} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24">
          {/* Hero Section */}
          <section className="relative py-16 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background to-background" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
              >
                <ArrowLeft size={18} />
                Back to Courses
              </Link>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Course Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-2"
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    Radiology
                  </span>
                  
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                    {course.title}
                  </h1>

                  <p className="text-muted-foreground text-lg mb-8">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      <Star size={20} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-foreground">{course.rating}</span>
                      <span className="text-muted-foreground">({course.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users size={18} />
                      <span>{course.students} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock size={18} />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen size={18} />
                      <span>{course.modules} modules</span>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-4 p-4 glass-card rounded-xl">
                    <img
                      src={course.instructor.image}
                      alt={course.instructor.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">Instructor</p>
                      <h4 className="font-display font-semibold text-foreground">{course.instructor.name}</h4>
                      <p className="text-sm text-muted-foreground">{course.instructor.title}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Purchase Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="lg:col-span-1"
                >
                  <div className="glass-card p-6 sticky top-28">
                    <div className="aspect-video rounded-lg overflow-hidden mb-6 relative group cursor-pointer">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center group-hover:bg-background/60 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                          <Play className="text-primary-foreground" size={28} fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-4xl font-bold text-foreground">${course.price}</span>
                      <span className="text-muted-foreground line-through">$499</span>
                      <span className="text-primary text-sm font-medium">40% off</span>
                    </div>

                    <Button variant="hero" size="xl" className="w-full mb-4">
                      Enroll Now
                    </Button>
                    <Button variant="outline" size="lg" className="w-full">
                      Add to Wishlist
                    </Button>

                    <p className="text-center text-sm text-muted-foreground mt-4">
                      30-day money-back guarantee
                    </p>

                    <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                      {course.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <CheckCircle size={16} className="text-primary" />
                          <span className="text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Course Curriculum */}
          <section className="py-16 bg-card/30">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-3xl font-bold text-foreground mb-8">
                Course Curriculum
              </h2>

              <div className="space-y-4 max-w-4xl">
                {course.curriculum.map((module, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="glass-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{module.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {module.lessons} lessons • {module.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {module.free ? (
                          <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">Preview</span>
                        ) : (
                          <Lock size={16} className="text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
                What You'll Get
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {[
                  { icon: Play, title: "HD Video Lessons", desc: "Crystal clear video content" },
                  { icon: Download, title: "Downloadable Notes", desc: "Study materials included" },
                  { icon: Award, title: "Certification", desc: "Industry-recognized certificate" },
                  { icon: Globe, title: "Lifetime Access", desc: "Learn at your own pace" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="glass-card p-6 text-center"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="text-primary" size={24} />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CourseDetail;

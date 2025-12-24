import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, BookOpen, Users, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const courses = [
  {
    id: 1,
    title: "Radiology Fundamentals",
    description: "Master the basics of medical imaging interpretation and radiological anatomy.",
    image: "https://images.unsplash.com/photo-1559757175-7b21671e94e0?w=800&h=500&fit=crop",
    duration: "40 hours",
    modules: 12,
    students: 1234,
    rating: 4.9,
    price: "$299",
    tag: "Bestseller",
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
    price: "$249",
    tag: "Popular",
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
    price: "$399",
    tag: "New",
  },
];

export const CoursesPreview = () => {
  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Courses
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Start Your Learning{" "}
              <span className="text-gradient">Journey</span>
            </h2>
          </div>
          <Button variant="outline" asChild className="hidden md:flex">
            <Link to="/courses" className="flex items-center gap-2">
              View All Courses
              <ArrowRight size={18} />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card overflow-hidden card-hover group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {course.tag}
                </span>
              </div>

              <div className="p-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
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
                  <div className="text-xl font-bold text-primary">{course.price}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Button variant="outline" asChild>
            <Link to="/courses" className="flex items-center gap-2">
              View All Courses
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

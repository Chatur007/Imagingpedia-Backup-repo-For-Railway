import { motion } from "framer-motion";
import { BookOpen, Video, FileText, Trophy, Shield, Users,Brain,BookCopy,ChartNoAxesCombined,Microscope } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Adaptive Exam Engine",
    description: "AI identifies weak areas and automatically adjusts difficulty and case selection.",
  },
  {
    icon: BookCopy,
    title: "Intelligent Case Simulation",
    description: "CT, MRI, and ultrasound cases with AI-generated structured reporting feedback.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Performance Analytics",
    description: "Real time exam scoring, percentile benchmarking, and knowledge-gap mapping.",
  },
  {
    icon: Microscope,
    title: "Image Guided Procedure Pathways",
    description: "Step by step IR modules with complication scenarios and decision tree learning.",
  },
  // {
  //   icon: Shield,
  //   title: "Progress Tracking",
  //   description: "Monitor your learning journey with detailed progress analytics and completion badges.",
  // },
  // {
  //   icon: Users,
  //   title: "Expert Instructors",
  //   description: "Learn from practicing radiologists, anatomists, and medical imaging specialists.",
  // },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const FeaturesSection = () => {
  return (
    <section className="py-24 section-gradient">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need to{" "}
            <span className="text-gradient">Excel</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our platform is designed with medical professionals in mind, offering 
            secure, comprehensive, and effective learning tools.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card p-6 card-hover group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

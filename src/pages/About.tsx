import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Target, Users, Award, Heart } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CTASection } from "@/components/home/CTASection";

const values = [
  {
    icon: Target,
    title: "Excellence in Education",
    description: "We strive to deliver the highest quality medical education content, developed by experts in the field.",
  },
  {
    icon: Users,
    title: "Accessible Learning",
    description: "Making world-class medical education accessible to healthcare professionals worldwide.",
  },
  {
    icon: Award,
    title: "Industry Recognition",
    description: "Our courses are recognized by leading medical institutions and professional bodies.",
  },
  {
    icon: Heart,
    title: "Student Success",
    description: "We're committed to the success of every student, providing support at every step.",
  },
];

const team = [
  {
    name: "Dr. Michael Roberts",
    role: "Chief Medical Officer",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    bio: "25+ years in radiology, former Stanford Medical faculty.",
  },
  {
    name: "Dr. Sarah Chen",
    role: "Head of Curriculum",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    bio: "Medical education specialist with publications in top journals.",
  },
  {
    name: "Dr. James Wilson",
    role: "Lead Instructor",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop",
    bio: "Board-certified radiologist and award-winning educator.",
  },
];

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Imagingpedia</title>
        <meta name="description" content="Learn about Imagingpedia's mission to provide premium medical education to healthcare professionals worldwide." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24">
          {/* Hero */}
          <section className="py-20 section-gradient">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto text-center"
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  About Us
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Advancing Medical Education{" "}
                  <span className="text-gradient">Globally</span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Founded in 2020, Imagingpedia has grown to become a leading platform for medical 
                  imaging education. Our mission is to make high-quality medical education 
                  accessible to healthcare professionals around the world.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-16 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: "5,000+", label: "Active Students" },
                  { value: "15+", label: "Expert Courses" },
                  { value: "98%", label: "Pass Rate" },
                  { value: "50+", label: "Countries Reached" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-4xl md:text-5xl font-display font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Our Core <span className="text-gradient">Values</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  The principles that guide everything we do at Imagingpedia.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="glass-card p-6 text-center"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="text-primary" size={28} />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Meet Our <span className="text-gradient">Team</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  World-class medical professionals dedicated to your success.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {team.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass-card p-6 text-center"
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-primary/30"
                    />
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-primary text-sm mb-2">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <CTASection />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default About;

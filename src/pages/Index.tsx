import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CoursesPreview } from "@/components/home/CoursesPreview";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Imagingpedia - Premium Medical Education Platform</title>
        <meta
          name="description"
          content="Master medical imaging with comprehensive courses in radiology, anatomy, and diagnostic sciences. Learn from world-class instructors with secure, professional video content."
        />
        <meta name="keywords" content="medical education, radiology, anatomy, medical imaging, online courses, healthcare training" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <CoursesPreview />
          <TestimonialsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isAuthenticated, getCurrentUser, logout } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Courses", path: "/courses" },
  { name: "Tests", path: "/tests" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean>(isAuthenticated());
  const [displayName, setDisplayName] = useState<string>(getCurrentUser()?.name || "");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Update auth state on navigation or storage changes
    const update = () => {
      const auth = isAuthenticated();
      setAuthed(auth);
      setDisplayName(getCurrentUser()?.name || "");
    };
    update();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "imagingpedia_current_user_email" || e.key === "imagingpedia_users") {
        update();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    logout();
    setAuthed(false);
    setDisplayName("");
    toast({ title: "Logged out", description: "You have been signed out." });
    navigate("/", { replace: true });
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "glass py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          {/* <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
             <span className="text-primary font-display font-bold text-xl">I</span>
            <img src="/Logo_3-removebg-preview.png" alt="logo" />
          </div> */}
             <div className="w-20 h-20 flex items-center justify-center">
            {/* <span className="text-primary font-display font-bold text-xl">I</span> */}
            <img 
              src="/logo.png" 
              alt="logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-display text-2xl font-semibold text-foreground" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            Imaging<span className="text-primary">pedia</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors link-underline",
                location.pathname === link.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
          <Button asChild size="sm" className="ml-2">
            <Link to="/start-test">Bigin Test</Link>
          </Button>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* {authed ? (
            <>
              <span className="text-sm text-muted-foreground">Hello, {displayName.split(" ")[0]}</span>
              <Button variant="outline" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" onClick={handleLogout}>Log Out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/signup">Start Learning</Link>
              </Button>
            </>
          )} */}
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link to="/admin/login">Admin</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border/50"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-base font-medium py-2 transition-colors",
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Button asChild className="w-full mt-2">
                <Link to="/start-test">Bigin Test</Link>
              </Button>
              <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                {/* {authed ? (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={handleLogout}>
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/login">Log In</Link>
                    </Button>
                    <Button variant="hero" asChild className="w-full">
                      <Link to="/signup">Start Learning</Link>
                    </Button>
                  </>
                )} */}
                <Button variant="ghost" asChild className="w-full text-xs">
                  <Link to="/admin/login">Admin Login</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

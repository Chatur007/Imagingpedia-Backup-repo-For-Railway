import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface RequireAdminAuthProps {
  children: React.ReactNode;
}

const RequireAdminAuth = ({ children }: RequireAdminAuthProps) => {
  const navigate = useNavigate();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if admin token exists and is valid
    const adminToken = localStorage.getItem("adminToken");
    
    if (!adminToken) {
      setIsAuthenticated(false);
      setIsAuthChecked(true);
      navigate("/admin/login", { replace: true });
      return;
    }

    // Verify token with backend (optional but more secure)
    const verifyToken = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/admin/verify`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          }
        );

        if (response.ok) {
          setIsAuthenticated(true);
          setIsAuthChecked(true);
        } else {
          // Token is invalid or expired
          localStorage.removeItem("adminToken");
          localStorage.removeItem("admin");
          setIsAuthenticated(false);
          setIsAuthChecked(true);
          navigate("/admin/login", { replace: true });
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        setIsAuthenticated(false);
        setIsAuthChecked(true);
        navigate("/admin/login", { replace: true });
      }
    };

    verifyToken();
  }, [navigate]);

  // Return null while checking authentication
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  // If not authenticated, don't render anything (already redirected)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render protected content
  return <>{children}</>;
};

export default RequireAdminAuth;

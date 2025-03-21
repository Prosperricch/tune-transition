
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-7xl font-bold mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-8">This track doesn't exist</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-player-accent text-white px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-colors"
        >
          <Home className="h-5 w-5" />
          Return Home
        </Link>
      </div>
    </PageTransition>
  );
};

export default NotFound;

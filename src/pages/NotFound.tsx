import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { NavMenu } from "@/components/NavMenu";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />
      <main className="container mx-auto px-4 py-20 flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
          <p className="mb-6 text-xl text-muted-foreground">Oops! Page not found</p>
          <Link to="/">
            <Button variant="hero">Return to Home</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFound;

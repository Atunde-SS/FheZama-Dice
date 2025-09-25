import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-board flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center bg-card/80 backdrop-blur-sm border-primary/20">
        <CardContent className="pt-6 pb-6">
          <div className="text-8xl mb-4">🎲</div>
          <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-xl text-foreground mb-4">Oops! Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you rolled off the game board! The page you're looking for doesn't exist.
          </p>
          <Button 
            variant="game" 
            size="lg" 
            onClick={() => window.location.href = "/"}
            className="w-full"
          >
            🏠 Return to Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;

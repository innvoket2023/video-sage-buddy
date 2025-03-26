import React from "react";
import { Navigate } from "react-router-dom";
import { tokenManager } from "@/api/authApi";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { toast } = useToast();
  const isAuthenticated = !!tokenManager.getToken();

  if (!isAuthenticated) {
    toast({
      title: "Access Denied",
      description: "Please log in to continue accessing this page",
      variant: "destructive",
    });

    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

import React from "react";
import { Navigation } from "@/components/LearningPortal/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminSimple: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || user?.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="flex">
        <div className="flex-1 p-8">
          <h1>Admin Panel</h1>
        </div>
      </div>
    </div>
  );
};

export default AdminSimple;
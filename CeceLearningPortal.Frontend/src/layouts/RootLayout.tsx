import React from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "@/components/LearningPortal/Navigation";

const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Outlet />
    </div>
  );
};

export default RootLayout;

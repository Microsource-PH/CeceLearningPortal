import React from "react";
import { Outlet } from "react-router-dom";
import { HubHeader } from "@/components/hub/HubHeader";

/**
 * Shared layout wrapper for all /hub routes to keep spacing & future sidebar/header consistency.
 * Currently simple; can host hub-level navigation, filters, or breadcrumbs later.
 */
const HubLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HubHeader />
      <div className="flex-1 flex flex-col gap-20">
        <Outlet />
      </div>
    </div>
  );
};

export default HubLayout;

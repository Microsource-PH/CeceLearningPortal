import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import resourceHubService from "@/services/resourceHubService";

const HubAbout: React.FC = () => {
  const { data } = useQuery<{
    title?: string;
    body?: string;
    heroImageUrl?: string;
  }>({
    queryKey: ["hub-about"],
    queryFn: async () => (await resourceHubService.getAbout()).data,
  });
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <nav className="text-sm text-muted-foreground">
        <Link to="/hub" className="hover:underline">
          Hub
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">About</span>
      </nav>
      <h1 className="text-2xl font-bold">
        {data?.title || "About Our Resource Hub"}
      </h1>
      {data?.heroImageUrl && (
        <img src={data.heroImageUrl} alt="Hero" className="rounded" />
      )}
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: data?.body || "" }}
      />
    </div>
  );
};

export default HubAbout;

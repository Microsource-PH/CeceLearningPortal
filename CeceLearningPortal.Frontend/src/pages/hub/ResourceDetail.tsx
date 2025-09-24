import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import resourceHubService from "@/services/resourceHubService";

const ResourceDetail: React.FC = () => {
  const { resourceSlug } = useParams();
  const { data } = useQuery<any>({
    queryKey: ["resource", resourceSlug],
    queryFn: async () =>
      (await resourceHubService.getResourceBySlug(resourceSlug!)).data,
    enabled: !!resourceSlug,
  });
  if (!data) return null;
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <nav className="text-sm text-muted-foreground">
        <Link to="/hub" className="hover:underline">
          Hub
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{data.title}</span>
      </nav>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{data.title}</h1>
        <Link
          to="/hub/directory"
          className="text-sm text-primary hover:underline"
        >
          Back to Directory
        </Link>
      </div>
      {data.thumbnailUrl && (
        <img src={data.thumbnailUrl} alt={data.title} className="rounded" />
      )}
      <div className="text-muted-foreground">{data.summary}</div>
      {data.fileUrl && data.type === "pdf" && (
        <iframe src={data.fileUrl} className="w-full h-[600px] rounded" />
      )}
      {data.type === "video" && data.externalUrl && (
        <div className="aspect-video">
          <iframe src={data.externalUrl} className="w-full h-full rounded" />
        </div>
      )}
    </div>
  );
};

export default ResourceDetail;

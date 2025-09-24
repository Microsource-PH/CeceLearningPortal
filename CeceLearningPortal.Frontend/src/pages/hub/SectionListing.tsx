import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import resourceHubService from "@/services/resourceHubService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SectionListing: React.FC = () => {
  const { sectionSlug } = useParams();
  const { data: section } = useQuery<any>({
    queryKey: ["section", sectionSlug],
    queryFn: async () =>
      sectionSlug === "all"
        ? null
        : (await resourceHubService.getSectionBySlug(sectionSlug!)).data,
  });
  const { data: resources } = useQuery<any>({
    queryKey: ["resources", sectionSlug],
    queryFn: async () =>
      (
        await resourceHubService.searchResources({
          sectionId: section?.id,
          sortBy: "newest",
          page: 1,
          pageSize: 24,
        })
      ).data,
    enabled: sectionSlug === "all" ? false : !!section?.id,
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <nav className="text-sm text-muted-foreground">
        <Link to="/hub" className="hover:underline">
          Hub
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">
          {sectionSlug === "all" ? "All Sections" : section?.name || "Section"}
        </span>
      </nav>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {sectionSlug === "all" ? "All Sections" : section?.name}
        </h1>
        <Link
          to="/hub/directory"
          className="text-sm text-primary hover:underline"
        >
          Back to Directory
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(resources?.items || []).map((r: any) => (
          <Card key={r.id} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{r.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">{r.summary}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SectionListing;

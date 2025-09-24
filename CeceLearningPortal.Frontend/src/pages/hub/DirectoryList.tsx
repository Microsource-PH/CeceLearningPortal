import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import resourceHubService from "@/services/resourceHubService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DirectoryList: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const { data, refetch } = useQuery<any>({
    queryKey: ["directory", { query }],
    queryFn: async () =>
      (
        await resourceHubService.directorySearch({
          query,
          page: 1,
          pageSize: 24,
        })
      ).data,
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Breadcrumb + Action */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <nav className="text-sm text-muted-foreground">
          <Link to="/hub" className="hover:underline">
            Hub
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Directory</span>
        </nav>
        <Link to="/hub/directory/submit">
          <Button>Create My Directory Profile</Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search profiles by name, skill, location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && refetch()}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(data?.items || []).map((p: any) => (
          <Card key={p.id} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {p.photoUrl && (
                  <img
                    src={p.photoUrl}
                    alt={p.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span>{p.displayName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">{p.headline}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(p.skills || []).slice(0, 6).map((s: string) => (
                  <span
                    key={s}
                    className="text-xs bg-muted px-2 py-0.5 rounded"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Array.isArray(data?.items) && data.items.length === 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>No profiles found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              Be the first to appear in the directory by creating your profile.
            </p>
            <Link to="/hub/directory/submit">
              <Button>Create My Directory Profile</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DirectoryList;

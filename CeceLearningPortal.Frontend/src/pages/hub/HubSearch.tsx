import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import resourceHubService from "@/services/resourceHubService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function useQueryString() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const HubSearch: React.FC = () => {
  const qs = useQueryString();
  const q = qs.get("q") || "";

  const { data, isLoading } = useQuery<any>({
    queryKey: ["hub-search", q],
    queryFn: async () =>
      (
        await resourceHubService.searchResources({
          query: q,
          sortBy: "newest",
          page: 1,
          pageSize: 24,
        })
      ).data,
    enabled: !!q,
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <nav className="text-sm text-muted-foreground">
        <Link to="/hub" className="hover:underline">
          Hub
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Search</span>
      </nav>
      <h1 className="text-2xl font-bold">Search Results</h1>
      {isLoading ? (
        <div>Searching…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(data?.items || []).map((r: any) => (
            <Link key={r.id} to={`/hub/resources/${r.slug}`}>
              <Card className="hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle>{r.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {r.summary}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HubSearch;

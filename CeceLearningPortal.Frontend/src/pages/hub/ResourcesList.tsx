import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import resourceHubService from "@/services/resourceHubService";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

interface HubResourceResult {
  items: any[];
  totalPages?: number;
  page?: number;
  pageSize?: number;
  total?: number;
}

export const ResourcesList: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = React.useState(params.get("q") || "");
  const [page, setPage] = React.useState(Number(params.get("page") || 1));
  const pageSize = 12;

  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery<HubResourceResult>({
    queryKey: ["hub-resources", { search, page }],
    queryFn: async (): Promise<HubResourceResult> => {
      const res = await resourceHubService.searchResources({
        query: search,
        page,
        pageSize,
      });
      const body = res.data as any;
      return {
        items: Array.isArray(body?.items)
          ? body.items
          : Array.isArray(body)
            ? body
            : [],
        totalPages: body?.totalPages ?? 1,
        total: body?.total ?? body?.items?.length ?? 0,
        page: body?.page ?? page,
        pageSize: body?.pageSize ?? pageSize,
      };
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async ({
      id,
      isBookmarked,
    }: {
      id: string;
      isBookmarked?: boolean;
    }) => {
      if (isBookmarked) return resourceHubService.removeBookmark(id);
      return resourceHubService.addBookmark(id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["hub-resources"] }),
  });

  React.useEffect(() => {
    const next = new URLSearchParams();
    if (search) next.set("q", search);
    if (page !== 1) next.set("page", String(page));
    setParams(next, { replace: true });
  }, [search, page, setParams]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <h1 className="text-2xl font-bold flex-1">All Resources</h1>
        <div className="flex gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search resources…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-sm text-red-600">
          Failed to load resources. Please try again.
        </div>
      ) : !(data as HubResourceResult | undefined)?.items?.length ? (
        <div className="text-sm text-muted-foreground pt-4">
          No resources found{search ? ` for "${search}"` : ""}.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {((data as HubResourceResult).items || []).map((r: any) => {
              const isBookmarked = r.isBookmarked;
              return (
                <Card
                  key={r.id}
                  className="group relative hover:shadow-lg transition flex flex-col"
                >
                  {r.type && (
                    <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-2 py-1 rounded">
                      {r.type}
                    </span>
                  )}
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={() =>
                        bookmarkMutation.mutate({ id: r.id, isBookmarked })
                      }
                      className="p-2 rounded-full bg-white/80 hover:bg-white shadow border"
                      title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`}
                      />
                    </button>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                        {r.type?.toUpperCase() || "DOC"}
                      </div>
                      <div className="flex-1 space-y-1">
                        <Link
                          to={`/hub/resources/${r.slug}`}
                          className="font-semibold leading-snug line-clamp-2 hover:text-primary"
                        >
                          {r.title}
                        </Link>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {r.summary}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 mt-auto space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {(r.tags || []).slice(0, 4).map((t: any) => (
                        <span
                          key={t.id}
                          className="text-[10px] uppercase tracking-wide bg-muted px-2 py-1 rounded"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-4">
                      {r.section?.name && (
                        <span className="text-primary">
                          in {r.section.name}
                        </span>
                      )}
                      {r.views != null && <span>👁️ {r.views}</span>}
                      {r.downloads != null && <span>⬇ {r.downloads}</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {data &&
            (data as HubResourceResult).totalPages &&
            (data as HubResourceResult).totalPages! > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-40"
                >
                  Prev
                </button>
                <div className="text-sm px-2 py-1">
                  Page {page} of {(data as HubResourceResult).totalPages}
                </div>
                <button
                  disabled={page === (data as HubResourceResult).totalPages}
                  onClick={() =>
                    setPage((p) =>
                      Math.min((data as HubResourceResult).totalPages!, p + 1)
                    )
                  }
                  className="px-3 py-1 text-sm border rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default ResourcesList;

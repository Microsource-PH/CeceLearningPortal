import React from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import resourceHubService from "@/services/resourceHubService";
import courseService from "@/services/courseService";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResourceCard } from "@/components/hub/ResourceCard";

// Extract query string params
function useQueryString() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const HubSearch: React.FC = () => {
  const qs = useQueryString();
  const initialQ = qs.get("q") || "";
  const [activeTab, setActiveTab] = React.useState("all");
  const queryClient = useQueryClient();

  // Search resources
  const {
    data: resourceData,
    isLoading: loadingResources,
    isError: resourceError,
  } = useQuery<any>({
    queryKey: ["search-resources", initialQ],
    queryFn: async () =>
      (
        await resourceHubService.searchResources({
          query: initialQ,
          sortBy: "newest",
          status: "published" as any,
          page: 1,
          pageSize: 30,
        })
      ).data,
    enabled: !!initialQ,
  });

  // Search courses
  const {
    data: courses,
    isLoading: loadingCourses,
    isError: coursesError,
  } = useQuery<any[]>({
    queryKey: ["search-courses", initialQ],
    queryFn: async (): Promise<any[]> =>
      (await courseService.getCourses({ search: initialQ, status: "active" }))
        .data as any[],
    enabled: !!initialQ,
  });

  // Bookmark toggle
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
      queryClient.invalidateQueries({ queryKey: ["search-resources"] }),
  });

  const resourceItems = resourceData?.items || [];
  const courseItems = Array.isArray(courses) ? courses : [];
  const totalCount = resourceItems.length + courseItems.length;
  const loading = loadingResources || loadingCourses;

  // Highlight query inside text
  const highlight = (text: string) => {
    if (!initialQ) return text;
    try {
      const re = new RegExp(
        `(${initialQ.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`,
        "ig"
      );
      return (
        <span>
          {text.split(re).map((part, i) =>
            re.test(part) ? (
              <mark key={i} className="bg-yellow-200 text-black px-0.5 rounded">
                {part}
              </mark>
            ) : (
              <React.Fragment key={i}>{part}</React.Fragment>
            )
          )}
        </span>
      );
    } catch {
      return text;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Search Results</h1>
        <p className="text-sm text-muted-foreground">
          {initialQ ? (
            <>
              Showing <span className="font-semibold">{totalCount}</span> result
              {totalCount === 1 ? "" : "s"} for "{initialQ}".
            </>
          ) : (
            "Use the global hub search bar to begin."
          )}
        </p>
      </div>
      {initialQ && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
            <TabsTrigger value="resources">
              Resources ({resourceItems.length})
            </TabsTrigger>
            <TabsTrigger value="courses">
              Courses ({courseItems.length})
            </TabsTrigger>
          </TabsList>
          <div className="mt-8">
            {loading && (
              <div className="text-sm text-muted-foreground">Searching…</div>
            )}
            {!loading && (resourceError || coursesError) && (
              <div className="text-sm text-red-600">
                Search failed. Please try again.
              </div>
            )}
            {!loading &&
              !resourceError &&
              !coursesError &&
              totalCount === 0 && (
                <div className="text-sm text-muted-foreground">
                  No results found.
                </div>
              )}
            <TabsContent value="all" className="space-y-14">
              {resourceItems.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Resources</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {resourceItems.map((r: any) => (
                      <ResourceCard
                        key={r.id}
                        resource={r}
                        onToggleBookmark={(id, b) =>
                          bookmarkMutation.mutate({ id, isBookmarked: b })
                        }
                      />
                    ))}
                  </div>
                </section>
              )}
              {courseItems.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Courses</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {courseItems.map((c: any) => (
                      <Card
                        key={c.id}
                        className="group relative flex flex-col rounded-xl border bg-card hover:shadow-md transition overflow-hidden p-5"
                      >
                        <div className="font-semibold line-clamp-2 mb-2">
                          {highlight(c.title)}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-3 flex-1">
                          {highlight(c.description)}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-3 pt-3 border-t flex items-center gap-3">
                          <span>{c.level}</span>
                          {c.studentsCount != null && (
                            <span>👥 {c.studentsCount}</span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </TabsContent>
            <TabsContent value="resources">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {resourceItems.map((r: any) => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    onToggleBookmark={(id, b) =>
                      bookmarkMutation.mutate({ id, isBookmarked: b })
                    }
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="courses">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courseItems.map((c: any) => (
                  <Card
                    key={c.id}
                    className="group relative flex flex-col rounded-xl border bg-card hover:shadow-md transition overflow-hidden p-5"
                  >
                    <div className="font-semibold line-clamp-2 mb-2">
                      {highlight(c.title)}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-3 flex-1">
                      {highlight(c.description)}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-3 pt-3 border-t flex items-center gap-3">
                      <span>{c.level}</span>
                      {c.studentsCount != null && (
                        <span>👥 {c.studentsCount}</span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
};

export default HubSearch;

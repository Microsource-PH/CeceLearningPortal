import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import resourceHubService from "@/services/resourceHubService";
import courseService from "@/services/courseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ResourceCard } from "@/components/hub/ResourceCard";
import { useDebounce } from "@/hooks/useDebounce";
// Note: Bookmark icon removed (handled inside ResourceCard)

interface HubSearchResult {
  items: any[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

const pageSize = 12;

const ResourceCenter: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState("resources");
  const [page, setPage] = React.useState(1);
  const [sectionId, setSectionId] = React.useState<string | undefined>();
  const [types, setTypes] = React.useState<string[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 400);

  const queryClient = useQueryClient();

  const { data: sections } = useQuery<any[]>({
    queryKey: ["hub-sections"],
    queryFn: async (): Promise<any[]> =>
      (await resourceHubService.getSections()).data as any[],
  });

  const { data: tags } = useQuery<any[]>({
    queryKey: ["hub-tags"],
    queryFn: async (): Promise<any[]> =>
      (await resourceHubService.getTags()).data as any[],
  });

  const {
    data: resourceDataRaw,
    isLoading: loadingResources,
    isError: resError,
  } = useQuery<any>({
    queryKey: [
      "resources-search",
      {
        debouncedQuery,
        page,
        sectionId,
        types: types.slice().sort(),
        selectedTags: selectedTags.slice().sort(),
      },
    ],
    queryFn: async () =>
      (
        await resourceHubService.searchResources({
          query: debouncedQuery,
          page,
          pageSize,
          sectionId,
          types: types as any,
          tagIds: selectedTags,
          sortBy: "newest",
        })
      ).data as HubSearchResult,
  });

  const { data: coursesData, isLoading: loadingCourses } = useQuery<any>({
    queryKey: ["all-courses"],
    queryFn: async () => (await courseService.getCourses()).data,
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
      queryClient.invalidateQueries({ queryKey: ["resources-search"] }),
  });

  const toggleType = (t: string) => {
    setPage(1);
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };
  const toggleTag = (id: string) => {
    setPage(1);
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const resetFilters = () => {
    setSectionId(undefined);
    setTypes([]);
    setSelectedTags([]);
    setPage(1);
  };

  const resourceData = resourceDataRaw as HubSearchResult | undefined;
  const resourceItems = resourceData?.items ?? [];
  const totalPages = resourceData?.totalPages ?? 1;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex-1 space-y-1">
          <h1 className="text-2xl font-bold">Resource Center</h1>
          <p className="text-sm text-muted-foreground">
            Unified access to learning resources, templates & courses.
          </p>
        </div>
        <Link
          to="/hub/sections/all"
          className="text-sm text-primary hover:underline"
        >
          Browse Sections →
        </Link>
      </div>
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
        }}
      >
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Filters */}
          {tab === "resources" && (
            <aside className="lg:col-span-3 space-y-8">
              <div className="space-y-3">
                <Input
                  placeholder="Search resources..."
                  value={query}
                  onChange={(e) => {
                    setPage(1);
                    setQuery(e.target.value);
                  }}
                />
                <div className="text-[11px] text-muted-foreground">
                  Searching {resourceItems.length} of{" "}
                  {resourceData?.total ?? resourceItems.length} results
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Section
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSectionId(undefined);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-full border text-xs ${!sectionId ? "bg-primary text-white border-primary" : "hover:bg-muted"}`}
                  >
                    All
                  </button>
                  {(sections || []).map((s: any) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSectionId(s.id === sectionId ? undefined : s.id);
                        setPage(1);
                      }}
                      className={`px-3 py-1 rounded-full border text-xs line-clamp-1 ${sectionId === s.id ? "bg-primary text-white border-primary" : "hover:bg-muted"}`}
                      title={s.name}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Types
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "pdf",
                    "doc",
                    "sheet",
                    "video",
                    "image",
                    "link",
                    "bundle",
                  ].map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 text-xs cursor-pointer"
                    >
                      <Checkbox
                        checked={types.includes(t)}
                        onCheckedChange={() => toggleType(t)}
                        id={`type-${t}`}
                      />
                      <span className="capitalize">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tags
                </div>
                <div className="flex flex-wrap gap-2 max-h-44 overflow-auto pr-1">
                  {(tags || []).slice(0, 40).map((t: any) => {
                    const active = selectedTags.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => toggleTag(t.id)}
                        className={`text-[10px] px-2 py-1 rounded-full border ${active ? "bg-primary text-white border-primary" : "hover:bg-muted"}`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              {(sectionId || types.length || selectedTags.length || query) && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-primary hover:underline"
                >
                  Reset Filters
                </button>
              )}
            </aside>
          )}
          {/* Content */}
          <div
            className={`${tab === "resources" ? "lg:col-span-9" : "lg:col-span-12"} space-y-8`}
          >
            {tab === "resources" && (
              <>
                {loadingResources ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="h-72 animate-pulse" />
                    ))}
                  </div>
                ) : resError ? (
                  <div className="text-sm text-red-600">
                    Failed to load resources.
                  </div>
                ) : !resourceItems.length ? (
                  <div className="text-sm text-muted-foreground">
                    No resources found.
                  </div>
                ) : (
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
                )}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <div className="text-xs px-2 py-1">
                      Page {page} / {totalPages}
                    </div>
                    <button
                      disabled={page === totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="px-3 py-1 text-sm border rounded disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
            {tab === "courses" && (
              <>
                {loadingCourses ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="h-48 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(coursesData || [])
                      .filter((c: any) =>
                        c.title.toLowerCase().includes(query.toLowerCase())
                      )
                      .map((c: any) => (
                        <Card
                          key={c.id}
                          className="group relative flex flex-col rounded-xl border bg-card hover:shadow-md transition overflow-hidden p-5"
                        >
                          <div className="font-semibold line-clamp-2 mb-2">
                            {c.title}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-3 flex-1">
                            {c.description}
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
                )}
              </>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default ResourceCenter;

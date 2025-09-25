import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import resourceHubService from "@/services/resourceHubService";
import { Skeleton } from "@/components/ui/skeleton";
import { HubHero } from "@/components/hub/HubHero";
import { Bookmark } from "lucide-react";

const HubLanding: React.FC = () => {
  const [q, setQ] = React.useState("");

  const { data: featuredSections, isLoading: loadingSections } = useQuery<
    any[]
  >({
    queryKey: ["hub-sections-featured"],
    queryFn: async () =>
      (await resourceHubService.getSections(true)).data as any[],
  });

  const { data: featuredResources, isLoading: loadingFeatured } = useQuery<any>(
    {
      queryKey: ["hub-featured-resources"],
      queryFn: async () =>
        (
          await resourceHubService.searchResources({
            sortBy: "newest",
            page: 1,
            pageSize: 6,
          })
        ).data,
    }
  );

  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries({ queryKey: ["hub-featured-resources"] }),
  });

  return (
    <div className="space-y-20">
      <HubHero query={q} setQuery={setQ} />

      {/* Explore Sections */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Explore Sections</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Organized collections of resources to help you learn and grow
            </p>
          </div>
          <Link
            to="/hub/sections/all"
            className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md border hover:bg-muted"
          >
            <span>All Sections</span>
            <span>→</span>
          </Link>
        </div>
        {loadingSections ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.isArray(featuredSections) &&
              featuredSections.map((s: any) => (
                <Link key={s.id} to={`/hub/sections/${s.slug}`}>
                  <div className="group h-full rounded-xl border bg-card hover:shadow-md transition flex flex-col p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                        {s.name?.slice(0, 2) || "SE"}
                      </div>
                      {s.isFeatured && (
                        <span className="text-[10px] font-medium bg-primary text-white px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="font-semibold leading-snug mb-1 line-clamp-1">
                      {s.name}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2 flex-1">
                      {s.description}
                    </div>
                    {s.resourceCount != null && (
                      <div className="mt-3 pt-3 border-t text-[11px] text-primary font-medium">
                        {s.resourceCount} resources
                      </div>
                    )}
                  </div>
                </Link>
              ))}
          </div>
        )}
      </section>

      {/* Featured Resources */}
      <section className="max-w-6xl mx-auto px-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Featured Resources</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Handpicked content from our community and experts
            </p>
          </div>
          <Link
            to="/hub/resource-center"
            className="text-sm inline-flex items-center gap-1 text-primary hover:underline"
          >
            View All <span>→</span>
          </Link>
        </div>
        {loadingFeatured ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(featuredResources?.items || []).map((r: any) => {
              const isBookmarked = r.isBookmarked;
              return (
                <div
                  key={r.id}
                  className="group relative flex flex-col rounded-xl border bg-card hover:shadow-md transition overflow-hidden"
                >
                  <button
                    onClick={() =>
                      bookmarkMutation.mutate({ id: r.id, isBookmarked })
                    }
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white shadow border"
                    title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`}
                    />
                  </button>
                  <div className="p-6 pb-4 flex-1 flex flex-col">
                    <div className="w-14 h-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold mb-4">
                      {r.type?.toUpperCase() || "DOC"}
                    </div>
                    <Link
                      to={`/hub/resources/${r.slug}`}
                      className="font-semibold leading-snug line-clamp-2 hover:text-primary mb-2"
                    >
                      {r.title}
                    </Link>
                    <div className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-1">
                      {r.summary}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(r.tags || []).slice(0, 3).map((t: any) => (
                        <span
                          key={t.id}
                          className="text-[10px] bg-muted px-2 py-1 rounded uppercase tracking-wide"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-4 mt-auto pt-3 border-t">
                      {r.section?.name && (
                        <span className="text-primary">
                          in {r.section.name}
                        </span>
                      )}
                      {r.views != null && <span>👁️ {r.views}</span>}
                      {r.publishedAt && (
                        <span>{r.publishedAtRelative || ""}</span>
                      )}
                      {r.downloads != null && (
                        <span className="ml-auto">⬇ {r.downloads}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-white p-12 text-center flex flex-col items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <h3 className="text-2xl font-semibold">Ready to Start Learning?</h3>
            <p className="text-sm md:text-base text-white/85 leading-relaxed">
              Join our community of learners and get access to exclusive
              resources, connect with mentors, and accelerate your growth.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/hub/directory" className="inline-block">
              <button className="px-6 h-11 rounded-lg font-medium bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur text-white inline-flex items-center gap-2">
                Browse Directory
              </button>
            </Link>
            <Link to="/hub/directory/submit" className="inline-block">
              <button className="px-6 h-11 rounded-lg font-medium bg-white text-primary hover:bg-white/90 inline-flex items-center gap-2">
                Join Directory
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HubLanding;

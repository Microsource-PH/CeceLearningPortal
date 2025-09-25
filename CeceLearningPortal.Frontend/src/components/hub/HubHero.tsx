import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Users, Download, BookMarked } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface HubHeroProps {
  query?: string;
  setQuery?: (v: string) => void;
  userName?: string;
  showLearningCtas?: boolean;
  searchDestinationPath?: string; // default /hub/search
  stats?: {
    resources?: number | string;
    students?: number | string;
    downloads?: number | string;
    bookmarks?: number | string;
  };
}

export const HubHero: React.FC<HubHeroProps> = ({
  query = "",
  setQuery,
  userName,
  showLearningCtas = true,
  searchDestinationPath = "/hub/search",
  stats,
}) => {
  const [internalQuery, setInternalQuery] = React.useState(query);
  const q = setQuery ? query : internalQuery;
  const location = useLocation();

  React.useEffect(() => {
    if (setQuery) return; // external controlled
    setInternalQuery(query);
  }, [query, setQuery]);

  const handleChange = (val: string) => {
    if (setQuery) setQuery(val);
    else setInternalQuery(val);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const target = `${searchDestinationPath}?q=${encodeURIComponent(q)}`;
    if (location.pathname === searchDestinationPath) {
      // just update url
      window.history.replaceState({}, "", target);
      window.dispatchEvent(new Event("popstate"));
    } else {
      window.location.href = target;
    }
  };

  const resourceCount = stats?.resources ?? "500+";
  const studentCount = stats?.students ?? "2.1K";
  const downloadCount = stats?.downloads ?? "15K";
  const bookmarkCount = stats?.bookmarks;

  return (
    <section className="relative overflow-hidden">
      {/* Background Illustration / Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/60 to-indigo-700" />
      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%,rgba(255,255,255,0.4),transparent 60%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 flex flex-col gap-10 text-white">
        <div className="max-w-4xl space-y-7">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-wide bg-white/10 backdrop-blur px-3 py-1 rounded-full border border-white/20">
              ✨ New Resources Added Weekly
            </span>
            {userName && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide bg-white/10 backdrop-blur px-3 py-1 rounded-full border border-white/20">
                👋 Welcome back
              </span>
            )}
          </div>
          {userName ? (
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
              <span className="block">
                Welcome back,{" "}
                <span className="text-yellow-300">{userName}!</span>
              </span>
              <span className="bg-gradient-to-r from-white to-yellow-300 bg-clip-text text-transparent block mt-2">
                Continue Learning & Exploring Resources
              </span>
            </h1>
          ) : (
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
              Your Central Hub for{" "}
              <span className="text-yellow-300">Learning Resources</span>
            </h1>
          )}
          <p className="text-base md:text-lg text-white/85 leading-relaxed max-w-2xl">
            Discover curated AI tools, templates, strategies, and connect with
            fellow learners. Everything you need to accelerate your growth in
            one place.
          </p>
          {/* Search Bar */}
          <form
            onSubmit={submitSearch}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl"
          >
            <div className="flex-1 relative">
              <Input
                placeholder="Search resources, templates, guides..."
                value={q}
                onChange={(e) => handleChange(e.target.value)}
                className="h-14 pl-5 pr-14 rounded-xl bg-white/20 border-white/30 text-white placeholder:text-white/70 backdrop-blur focus:bg-white/25"
              />
              <button
                type="submit"
                className="absolute top-1.5 right-1.5 h-11 w-11 inline-flex items-center justify-center rounded-lg bg-white text-primary hover:bg-white/90 transition"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
          {showLearningCtas && (
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/learning-dashboard">
                <Button className="h-12 px-8 rounded-xl font-semibold bg-white text-primary hover:bg-white/90">
                  Start Learning
                </Button>
              </Link>
              <Link to="/courses">
                <Button
                  variant="outline"
                  className="h-12 px-8 rounded-xl font-semibold border-white/30 text-white hover:bg-white/10"
                >
                  View Courses
                </Button>
              </Link>
              <Link to="/hub/resource-center">
                <Button
                  variant="ghost"
                  className="h-12 px-6 rounded-xl font-semibold text-white/90 hover:bg-white/10"
                >
                  Explore Resources
                </Button>
              </Link>
            </div>
          )}
          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-8 pt-4 text-sm font-medium">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> {resourceCount}{" "}
              <span className="font-normal opacity-80">Resources</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" /> {studentCount}{" "}
              <span className="font-normal opacity-80">Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" /> {downloadCount}{" "}
              <span className="font-normal opacity-80">Downloads</span>
            </div>
            {bookmarkCount != null && (
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4" /> {bookmarkCount}{" "}
                <span className="font-normal opacity-80">Bookmarks</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

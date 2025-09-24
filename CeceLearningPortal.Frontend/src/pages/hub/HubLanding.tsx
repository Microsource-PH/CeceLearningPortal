import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import resourceHubService from "@/services/resourceHubService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

const HubLanding: React.FC = () => {
  const [q, setQ] = React.useState("");
  const { user } = useAuth();
  const { data: about } = useQuery<{ title?: string; heroImageUrl?: string }>({
    queryKey: ["hub-about"],
    queryFn: async () => (await resourceHubService.getAbout()).data,
  });
  const { data: featuredSections, isLoading: loadingSections } = useQuery<
    any[]
  >({
    queryKey: ["hub-sections-featured"],
    queryFn: async () =>
      (await resourceHubService.getSections(true)).data as any[],
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground">
        <span className="text-foreground">Hub</span>
      </nav>
      <div className="relative rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-10 overflow-hidden">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">
            {about?.title || "Discover. Connect. Grow."}
          </h1>
          <p className="text-white/80 mb-4">Your learning, all in one place.</p>
          <div className="flex gap-2">
            <Input
              placeholder="Search resources, templates, profiles…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="bg-white text-black"
            />
            <Link to={`/hub/search?q=${encodeURIComponent(q)}`}>
              <Button variant="secondary">Search</Button>
            </Link>
          </div>
        </div>
        {about?.heroImageUrl && (
          <img
            src={about.heroImageUrl}
            alt="Hero"
            className="absolute right-0 top-0 h-full opacity-20"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/hub/about">
          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>About Us</CardTitle>
            </CardHeader>
            <CardContent>
              Learn about the CECE Resource Hub mission.
            </CardContent>
          </Card>
        </Link>
        <Link to="/hub/directory">
          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>Student Directory</CardTitle>
            </CardHeader>
            <CardContent>Find profiles, skills, and collaborators.</CardContent>
          </Card>
        </Link>
        <Link to="/hub/sections/all">
          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>Resource Library</CardTitle>
            </CardHeader>
            <CardContent>
              Explore templates, agents, docs, and more.
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/hub/directory/submit">
          <Button>Create My Directory Profile</Button>
        </Link>
        {user?.role === "Admin" && (
          <Link to="/hub/about/admin">
            <Button variant="outline">Edit About (Admin)</Button>
          </Link>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Featured Sections</h2>
        {loadingSections ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.isArray(featuredSections) &&
              featuredSections.map((s: any) => (
                <Link key={s.id} to={`/hub/sections/${s.slug}`}>
                  <Card className="hover:shadow-lg transition">
                    <CardHeader>
                      <CardTitle>{s.name}</CardTitle>
                    </CardHeader>
                    <CardContent>{s.description}</CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HubLanding;

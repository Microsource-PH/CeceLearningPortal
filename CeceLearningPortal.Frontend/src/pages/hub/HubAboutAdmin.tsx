import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import resourceHubService from "@/services/resourceHubService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

const HubAboutAdmin: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const { data } = useQuery<{
    title?: string;
    body?: string;
    heroImageUrl?: string;
    ctaButtons?: any[];
  }>({
    queryKey: ["hub-about"],
    queryFn: async () => (await resourceHubService.getAbout()).data,
  });
  const [title, setTitle] = useState("");
  const [heroImageUrl, setHero] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (data) {
      setTitle(data.title ?? "");
      setHero(data.heroImageUrl ?? "");
      setBody(data.body ?? "");
    }
  }, [data]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () =>
      (
        await resourceHubService.updateAbout({
          title,
          heroImageUrl,
          body,
          ctaButtons: (data as any)?.ctaButtons ?? [],
        })
      ).data,
  });

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        Only admins can edit the About page.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Edit Hub About</h1>
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Hero image URL"
            value={heroImageUrl}
            onChange={(e) => setHero(e.target.value)}
          />
          <Textarea
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
          />
        </CardContent>
      </Card>
      <Button disabled={isPending} onClick={() => mutate()}>
        {isPending ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
};

export default HubAboutAdmin;

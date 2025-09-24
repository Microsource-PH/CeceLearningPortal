import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import resourceHubService, {
  CreateStudentProfileDto,
} from "@/services/resourceHubService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const DirectorySubmit: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateStudentProfileDto>({
    displayName: "",
    headline: "",
    about: "",
    skills: [],
    locationCity: "",
    locationCountry: "",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    languages: [],
    photoUrl: "",
    portfolioLinks: {},
    linkedInUrl: "",
    twitterUrl: "",
    facebookUrl: "",
    websiteUrl: "",
    gitHubUrl: "",
    availability: "open",
    services: [],
    hourlyRate: "",
    certifications: [],
    consentPublicListing: false,
  });
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async () =>
      (await resourceHubService.directorySubmit(form)).data,
    onSuccess: () => navigate("/hub/directory"),
  });

  const addTo = (key: "skills" | "languages" | "services", value: string) => {
    const v = value.trim();
    if (!v) return;
    setForm((f) => ({ ...f, [key]: [...(f[key] as string[]), v] }) as any);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground">
        <Link to="/hub" className="hover:underline">
          Hub
        </Link>
        <span className="mx-2">/</span>
        <Link to="/hub/directory" className="hover:underline">
          Directory
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Submit</span>
      </nav>
      <h1 className="text-2xl font-bold">Create Your Public Profile</h1>
      <p className="text-muted-foreground">
        Your profile will appear in the public directory immediately after
        submission.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Display Name"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
          <Input
            placeholder="Headline (e.g., Frontend Developer)"
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
          />
          <Textarea
            placeholder="About you"
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="City"
              value={form.locationCity}
              onChange={(e) =>
                setForm({ ...form, locationCity: e.target.value })
              }
            />
            <Input
              placeholder="Country"
              value={form.locationCountry}
              onChange={(e) =>
                setForm({ ...form, locationCountry: e.target.value })
              }
            />
          </div>
          <Input
            placeholder="Photo URL"
            value={form.photoUrl}
            onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills & Languages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (addTo("skills", skillInput), setSkillInput(""))
                }
              />
              <Button
                type="button"
                onClick={() => {
                  addTo("skills", skillInput);
                  setSkillInput("");
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.skills.map((s, i) => (
                <Badge key={i} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a language"
                value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (addTo("languages", langInput), setLangInput(""))
                }
              />
              <Button
                type="button"
                onClick={() => {
                  addTo("languages", langInput);
                  setLangInput("");
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.languages?.map((s, i) => (
                <Badge key={i} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={form.availability === "open" ? "default" : "outline"}
              onClick={() => setForm({ ...form, availability: "open" })}
            >
              Open
            </Button>
            <Button
              variant={form.availability === "limited" ? "default" : "outline"}
              onClick={() => setForm({ ...form, availability: "limited" })}
            >
              Limited
            </Button>
            <Button
              variant={
                form.availability === "unavailable" ? "default" : "outline"
              }
              onClick={() => setForm({ ...form, availability: "unavailable" })}
            >
              Unavailable
            </Button>
          </div>
          <Input
            placeholder="Hourly Rate (optional)"
            value={form.hourlyRate}
            onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <input
          id="consent"
          type="checkbox"
          checked={form.consentPublicListing}
          onChange={(e) =>
            setForm({ ...form, consentPublicListing: e.target.checked })
          }
        />
        <label htmlFor="consent" className="text-sm text-muted-foreground">
          I consent to have my profile listed publicly in the directory.
        </label>
      </div>

      <div className="flex gap-3">
        <Button
          disabled={
            !form.displayName || !form.consentPublicListing || isPending
          }
          onClick={() => mutate()}
        >
          {isPending ? "Submitting…" : "Submit Profile"}
        </Button>
        <Button variant="ghost" onClick={() => navigate("/hub/directory")}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default DirectorySubmit;

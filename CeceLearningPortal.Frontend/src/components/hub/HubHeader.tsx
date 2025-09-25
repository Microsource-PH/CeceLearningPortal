import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type HubHeaderProps = {
  placeholder?: string;
  hideOnResourceDetail?: boolean; // defaults to true
};

export const HubHeader: React.FC<HubHeaderProps> = ({
  placeholder = "Search resources, courses, people...",
  hideOnResourceDetail = true,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialQ = params.get("q") || "";
  const [query, setQuery] = React.useState(initialQ);

  React.useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/hub/search?q=${encodeURIComponent(query.trim())}`);
  };

  const shouldHide =
    hideOnResourceDetail && /\/hub\/resources\//.test(location.pathname);
  if (shouldHide) return null;

  return (
    <div className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
        <div className="font-semibold text-primary text-sm tracking-wide">
          CECE Hub
        </div>
        <form onSubmit={submit} className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "pl-9 h-10 rounded-full bg-muted/60 focus:bg-background transition text-sm"
            )}
          />
        </form>
        <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded bg-muted">CTRL</span>
          <span className="px-2 py-1 rounded bg-muted">K</span>
          <span className="hidden lg:inline">Quick Search</span>
        </div>
      </div>
    </div>
  );
};

export default HubHeader;

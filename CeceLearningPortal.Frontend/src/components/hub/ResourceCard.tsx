import React from "react";
import { Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

export interface ResourceCardProps {
  resource: any; // TODO: tighten type with ResourceDto
  onToggleBookmark?: (id: string, isBookmarked?: boolean) => void;
  compact?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource: r,
  onToggleBookmark,
  compact,
}) => {
  const isBookmarked = r.isBookmarked;
  return (
    <Card
      className={`group relative flex flex-col rounded-xl border bg-card hover:shadow-md transition overflow-hidden ${compact ? "p-4" : ""}`}
    >
      {onToggleBookmark && (
        <button
          onClick={() => onToggleBookmark(r.id, isBookmarked)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white shadow border"
          title={isBookmarked ? "Remove bookmark" : "Bookmark"}
        >
          <Bookmark
            className={`w-4 h-4 ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
        </button>
      )}
      <div className={`${compact ? "" : "p-6 pb-4"} flex-1 flex flex-col`}>
        <div
          className={`${compact ? "w-10 h-10 mb-3" : "w-14 h-14 mb-4"} rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold`}
        >
          {r.type?.toUpperCase() || "DOC"}
        </div>
        <Link
          to={`/hub/resources/${r.slug}`}
          className={`font-semibold leading-snug line-clamp-2 hover:text-primary ${compact ? "mb-1" : "mb-2"}`}
        >
          {r.title}
        </Link>
        <div
          className={`text-xs text-muted-foreground line-clamp-3 mb-3 flex-1 ${compact ? "mb-2" : "mb-4"}`}
        >
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
            <span className="text-primary">in {r.section.name}</span>
          )}
          {r.views != null && <span>👁️ {r.views}</span>}
          {r.downloads != null && (
            <span className="ml-auto">⬇ {r.downloads}</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ResourceCard;

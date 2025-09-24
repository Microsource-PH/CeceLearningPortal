import api from "./api";

// DTOs (partial, aligned with backend controllers)
export type AccessLevel = "public" | "students" | "admins";
export type ResourceType = "pdf" | "doc" | "sheet" | "video" | "image" | "link" | "bundle" | "other";
export type ResourceSource = "upload" | "google-drive-link" | "youtube" | "vimeo" | "external-url";

export interface ResourceSectionDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  isFeatured?: boolean;
  access?: AccessLevel;
  iconUrl?: string;
  color?: string;
  resourceCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceTagDto {
  id: string;
  name: string;
  slug: string;
  usageCount?: number;
}

export interface ResourceDto {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  type: ResourceType;
  source?: ResourceSource;
  fileUrl?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  section?: { id: string; name: string; slug: string };
  tags?: ResourceTagDto[];
  access?: AccessLevel;
  ownerName?: string;
  status?: string;
  version?: number;
  views?: number;
  downloads?: number;
  bookmarks?: number;
  isBookmarked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  pageCount?: number;
}

export interface ResourceSearchQuery {
  query?: string;
  sectionId?: string;
  tagIds?: string[];
  types?: ResourceType[];
  status?: string;
  sortBy?: "newest" | "most-viewed" | "most-bookmarked";
  page?: number;
  pageSize?: number;
}

export interface StudentProfileDto {
  id: string;
  userId: string;
  displayName: string;
  headline?: string;
  about?: string;
  skills: string[];
  locationCity?: string;
  locationCountry?: string;
  timeZone?: string;
  languages?: string[];
  photoUrl?: string;
  linkedInUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  gitHubUrl?: string;
  availability?: string;
  services?: string[];
  hourlyRate?: string;
  status?: string;
  profileViews?: number;
  contactClicks?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentProfileDto {
  displayName: string;
  headline?: string;
  about?: string;
  skills: string[];
  locationCity?: string;
  locationCountry?: string;
  timeZone?: string;
  languages?: string[];
  photoUrl?: string;
  portfolioLinks?: Record<string, string>;
  linkedInUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  gitHubUrl?: string;
  availability?: "open" | "limited" | "unavailable";
  services?: string[];
  hourlyRate?: string;
  certifications?: { name: string; issuer?: string; year?: number }[];
  consentPublicListing: boolean;
}

export interface StudentProfileSearchDto {
  query?: string;
  skills?: string[];
  availability?: string;
  locationCity?: string;
  locationCountry?: string;
  page?: number;
  pageSize?: number;
}

export const resourceHubService = {
  // Resources
  searchResources: async (q: ResourceSearchQuery) => {
    return api.request("/resources/search", { method: "POST", body: JSON.stringify(q) });
  },
  getResourceBySlug: async (slug: string) => {
    return api.request(`/resources/${slug}`, { method: "GET" });
  },
  createResource: async (payload: any) => {
    return api.request("/resources", { method: "POST", body: JSON.stringify(payload) });
  },
  updateResource: async (id: string, payload: any) => {
    return api.request(`/resources/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  submitResourceForReview: async (id: string) => {
    return api.request(`/resources/${id}/submit-for-review`, { method: "POST" });
  },
  publishResource: async (id: string) => {
    return api.request(`/resources/${id}/publish`, { method: "POST" });
  },
  markDownloaded: async (id: string) => {
    return api.request(`/resources/${id}/downloaded`, { method: "POST" });
  },

  // Sections & Tags
  getSections: async (featuredOnly?: boolean) => {
    const qs = featuredOnly ? "?featuredOnly=true" : "";
    return api.request(`/sections${qs}`, { method: "GET" });
  },
  getSectionBySlug: async (slug: string) => {
    return api.request(`/sections/${slug}`, { method: "GET" });
  },
  getTags: async () => {
    return api.request(`/tags`, { method: "GET" });
  },

  // About
  getAbout: async () => {
    return api.request(`/hub-about`, { method: "GET" });
  },
  updateAbout: async (payload: any) => {
    return api.request(`/hub-about`, { method: "PUT", body: JSON.stringify(payload) });
  },

  // Directory
  directorySubmit: async (payload: CreateStudentProfileDto) => {
    return api.request(`/directory/submit`, { method: "POST", body: JSON.stringify(payload) });
  },
  directorySearch: async (payload: StudentProfileSearchDto) => {
    return api.request(`/directory/search`, { method: "POST", body: JSON.stringify(payload) });
  },
  directoryGetById: async (id: string) => {
    return api.request(`/directory/${id}`, { method: "GET" });
  },
  directoryReview: async (id: string, status: "approved" | "rejected", rejectionReason?: string) => {
    return api.request(`/directory/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ status, rejectionReason }),
    });
  },

  // Bookmarks
  getMyBookmarks: async () => {
    return api.request(`/bookmarks/me`, { method: "GET" });
  },
  addBookmark: async (resourceId: string, notes?: string) => {
    return api.request(`/bookmarks`, { method: "POST", body: JSON.stringify({ resourceId, notes }) });
  },
  removeBookmark: async (resourceId: string) => {
    return api.request(`/bookmarks/${resourceId}`, { method: "DELETE" });
  },
};

export default resourceHubService;

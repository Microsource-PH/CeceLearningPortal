using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CeceLearningPortal.Api.DTOs
{
    // Resource Section DTOs
    public class ResourceSectionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public string Description { get; set; }
        public int SortOrder { get; set; }
        public bool IsFeatured { get; set; }
        public string Access { get; set; }
        public string IconUrl { get; set; }
        public string Color { get; set; }
        public int ResourceCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateResourceSectionDto
    {
        [Required]
        [MaxLength(255)]
        public string Name { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string Slug { get; set; }
        
        public string Description { get; set; }
        public int SortOrder { get; set; } = 0;
        public bool IsFeatured { get; set; } = false;
        public string Access { get; set; } = "students";
        public string IconUrl { get; set; }
        public string Color { get; set; }
    }

    public class UpdateResourceSectionDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsFeatured { get; set; }
        public string Access { get; set; }
        public string IconUrl { get; set; }
        public string Color { get; set; }
    }

    // Resource Tag DTOs
    public class ResourceTagDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public int UsageCount { get; set; }
    }

    public class CreateResourceTagDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Slug { get; set; }
    }

    // Resource DTOs
    public class ResourceDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Slug { get; set; }
        public string Summary { get; set; }
        public string Type { get; set; }
        public string Source { get; set; }
        public string FileUrl { get; set; }
        public string ExternalUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public ResourceSectionDto Section { get; set; }
        public List<ResourceTagDto> Tags { get; set; }
        public string Access { get; set; }
        public string OwnerName { get; set; }
        public string Status { get; set; }
        public int Version { get; set; }
        public int Views { get; set; }
        public int Downloads { get; set; }
        public int Bookmarks { get; set; }
        public bool IsBookmarked { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public long? FileSize { get; set; }
        public string MimeType { get; set; }
        public int? Duration { get; set; }
        public int? PageCount { get; set; }
    }

    public class ResourceDetailDto : ResourceDto
    {
        public string Body { get; set; }
        public string MetaTitle { get; set; }
        public string MetaDescription { get; set; }
        public string OpenGraphImage { get; set; }
        public List<ResourceDto> RelatedResources { get; set; }
        public List<ResourceCommentDto> Comments { get; set; }
    }

    public class CreateResourceDto
    {
        [Required]
        [MaxLength(500)]
        public string Title { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Slug { get; set; }
        
        public string Summary { get; set; }
        public string Body { get; set; }
        
        [Required]
        public string Type { get; set; }
        
        [Required]
        public string Source { get; set; }
        
        public string FileUrl { get; set; }
        public string ExternalUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        
        [Required]
        public Guid SectionId { get; set; }
        
        public List<Guid> TagIds { get; set; } = new List<Guid>();
        public string Access { get; set; } = "students";
        public string MetaTitle { get; set; }
        public string MetaDescription { get; set; }
        public string OpenGraphImage { get; set; }
    }

    public class UpdateResourceDto
    {
        public string Title { get; set; }
        public string Summary { get; set; }
        public string Body { get; set; }
        public string FileUrl { get; set; }
        public string ExternalUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public Guid? SectionId { get; set; }
        public List<Guid> TagIds { get; set; }
        public string Access { get; set; }
        public string Status { get; set; }
        public string MetaTitle { get; set; }
        public string MetaDescription { get; set; }
        public string OpenGraphImage { get; set; }
    }

    // Student Profile DTOs
    public class StudentProfileDto
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public string DisplayName { get; set; }
        public string Headline { get; set; }
        public string About { get; set; }
        public List<string> Skills { get; set; }
        public string LocationCity { get; set; }
        public string LocationCountry { get; set; }
        public string TimeZone { get; set; }
        public List<string> Languages { get; set; }
        public string PhotoUrl { get; set; }
        public Dictionary<string, string> PortfolioLinks { get; set; }
        public string LinkedInUrl { get; set; }
        public string TwitterUrl { get; set; }
        public string FacebookUrl { get; set; }
        public string WebsiteUrl { get; set; }
        public string GitHubUrl { get; set; }
        public string Availability { get; set; }
        public List<string> Services { get; set; }
        public string HourlyRate { get; set; }
        public List<CertificationDto> Certifications { get; set; }
        public string Status { get; set; }
        public int ProfileViews { get; set; }
        public int ContactClicks { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateStudentProfileDto
    {
        [Required]
        [MaxLength(255)]
        public string DisplayName { get; set; }
        
        [MaxLength(500)]
        public string Headline { get; set; }
        
        public string About { get; set; }
        public List<string> Skills { get; set; } = new List<string>();
        public string LocationCity { get; set; }
        public string LocationCountry { get; set; }
        public string TimeZone { get; set; }
        public List<string> Languages { get; set; } = new List<string>();
        public string PhotoUrl { get; set; }
        public Dictionary<string, string> PortfolioLinks { get; set; } = new Dictionary<string, string>();
        public string LinkedInUrl { get; set; }
        public string TwitterUrl { get; set; }
        public string FacebookUrl { get; set; }
        public string WebsiteUrl { get; set; }
        public string GitHubUrl { get; set; }
        public string Availability { get; set; } = "unavailable";
        public List<string> Services { get; set; } = new List<string>();
        public string HourlyRate { get; set; }
        public List<CertificationDto> Certifications { get; set; } = new List<CertificationDto>();
        
        [Required]
        public bool ConsentPublicListing { get; set; }
    }

    public class UpdateStudentProfileDto
    {
        public string DisplayName { get; set; }
        public string Headline { get; set; }
        public string About { get; set; }
        public List<string> Skills { get; set; }
        public string LocationCity { get; set; }
        public string LocationCountry { get; set; }
        public string TimeZone { get; set; }
        public List<string> Languages { get; set; }
        public string PhotoUrl { get; set; }
        public Dictionary<string, string> PortfolioLinks { get; set; }
        public string LinkedInUrl { get; set; }
        public string TwitterUrl { get; set; }
        public string FacebookUrl { get; set; }
        public string WebsiteUrl { get; set; }
        public string GitHubUrl { get; set; }
        public string Availability { get; set; }
        public List<string> Services { get; set; }
        public string HourlyRate { get; set; }
        public List<CertificationDto> Certifications { get; set; }
    }

    public class CertificationDto
    {
        public string Name { get; set; }
        public string Issuer { get; set; }
        public DateTime? IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string CredentialUrl { get; set; }
    }

    public class ReviewStudentProfileDto
    {
        [Required]
        public string Status { get; set; } // approved, rejected
        public string RejectionReason { get; set; }
    }

    // Resource Bookmark DTOs
    public class ResourceBookmarkDto
    {
        public Guid ResourceId { get; set; }
        public ResourceDto Resource { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateResourceBookmarkDto
    {
        [Required]
        public Guid ResourceId { get; set; }
        public string Notes { get; set; }
    }

    // File Asset DTOs
    public class FileAssetDto
    {
        public Guid Id { get; set; }
        public string StorageKey { get; set; }
        public string OriginalFilename { get; set; }
        public string MimeType { get; set; }
        public long Size { get; set; }
        public string CdnUrl { get; set; }
        public string UploadStatus { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UploadFileDto
    {
        [Required]
        public string FileName { get; set; }
        
        [Required]
        public string MimeType { get; set; }
        
        [Required]
        public long Size { get; set; }
        
        public Guid? ResourceId { get; set; }
    }

    // Resource Activity Log DTOs
    public class ResourceActivityLogDto
    {
        public Guid Id { get; set; }
        public string ActorUserName { get; set; }
        public string Action { get; set; }
        public string TargetType { get; set; }
        public Guid? TargetId { get; set; }
        public Dictionary<string, object> Payload { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Resource Hub About DTOs
    public class ResourceHubAboutDto
    {
        public string Title { get; set; }
        public string HeroImageUrl { get; set; }
        public string Body { get; set; }
        public List<CtaButtonDto> CtaButtons { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateResourceHubAboutDto
    {
        public string Title { get; set; }
        public string HeroImageUrl { get; set; }
        public string Body { get; set; }
        public List<CtaButtonDto> CtaButtons { get; set; }
    }

    public class CtaButtonDto
    {
        public string Text { get; set; }
        public string Url { get; set; }
        public string Style { get; set; } // primary, secondary, outline
        public string Target { get; set; } // _self, _blank
    }

    // Resource Comment DTOs
    public class ResourceCommentDto
    {
        public Guid Id { get; set; }
        public Guid ResourceId { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string UserAvatar { get; set; }
        public Guid? ParentCommentId { get; set; }
        public string Content { get; set; }
        public bool IsEdited { get; set; }
        public bool IsDeleted { get; set; }
        public List<ResourceCommentDto> Replies { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateResourceCommentDto
    {
        [Required]
        public Guid ResourceId { get; set; }
        
        public Guid? ParentCommentId { get; set; }
        
        [Required]
        public string Content { get; set; }
    }

    public class UpdateResourceCommentDto
    {
        [Required]
        public string Content { get; set; }
    }

    // Search and Filter DTOs
    public class ResourceSearchDto
    {
        public string Query { get; set; }
        public Guid? SectionId { get; set; }
        public List<Guid> TagIds { get; set; } = new List<Guid>();
        public List<string> Types { get; set; } = new List<string>();
        public string Access { get; set; }
        public string Status { get; set; }
        public string SortBy { get; set; } = "newest"; // newest, most-viewed, most-bookmarked
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class StudentProfileSearchDto
    {
        public string Query { get; set; }
        public List<string> Skills { get; set; } = new List<string>();
        public List<string> Services { get; set; } = new List<string>();
        public string Availability { get; set; }
        public string LocationCity { get; set; }
        public string LocationCountry { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    // Analytics DTOs
    public class ResourceAnalyticsDto
    {
        public Guid ResourceId { get; set; }
        public string Title { get; set; }
        public int TotalViews { get; set; }
        public int TotalDownloads { get; set; }
        public int TotalBookmarks { get; set; }
        public Dictionary<DateTime, int> DailyViews { get; set; }
        public Dictionary<DateTime, int> DailyDownloads { get; set; }
        public List<string> TopReferrers { get; set; }
    }

    public class ResourceHubAnalyticsDto
    {
        public int TotalResources { get; set; }
        public int TotalSections { get; set; }
        public int TotalTags { get; set; }
        public int TotalProfiles { get; set; }
        public int TotalViews { get; set; }
        public int TotalDownloads { get; set; }
        public int TotalBookmarks { get; set; }
        public List<ResourceDto> TrendingResources { get; set; }
        public List<ResourceSectionDto> PopularSections { get; set; }
        public List<ResourceTagDto> PopularTags { get; set; }
        public Dictionary<string, int> ResourcesByType { get; set; }
        public Dictionary<string, int> ResourcesByStatus { get; set; }
    }
}
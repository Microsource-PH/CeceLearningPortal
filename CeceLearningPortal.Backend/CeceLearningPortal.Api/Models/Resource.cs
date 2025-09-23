using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CeceLearningPortal.Api.Models
{
    public class Resource
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Title { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Slug { get; set; }
        
        public string Summary { get; set; }
        
        public string Body { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } // pdf, doc, sheet, video, image, link, bundle, other
        
        [Required]
        [MaxLength(50)]
        public string Source { get; set; } // upload, google-drive-link, youtube, vimeo, external-url
        
        public string FileUrl { get; set; }
        
        public string ExternalUrl { get; set; }
        
        public string ThumbnailUrl { get; set; }
        
        public Guid SectionId { get; set; }
        
        [MaxLength(50)]
        public string Access { get; set; } = "students"; // public, students, admins
        
        public string OwnerUserId { get; set; }
        
        [MaxLength(50)]
        public string Status { get; set; } = "draft"; // draft, in_review, published, archived
        
        public int Version { get; set; } = 1;
        
        public Guid? ReplacesResourceId { get; set; }
        
        // SEO fields
        [MaxLength(255)]
        public string MetaTitle { get; set; }
        
        public string MetaDescription { get; set; }
        
        [MaxLength(500)]
        public string OpenGraphImage { get; set; }
        
        // Metrics
        public int Views { get; set; } = 0;
        
        public int Downloads { get; set; } = 0;
        
        public int Bookmarks { get; set; } = 0;
        
        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? PublishedAt { get; set; }
        
        // Additional metadata
        public long? FileSize { get; set; }
        
        [MaxLength(255)]
        public string MimeType { get; set; }
        
        public int? Duration { get; set; } // for videos in seconds
        
        public int? PageCount { get; set; } // for documents
        
        // Navigation properties
        public virtual ResourceSection Section { get; set; }
        public virtual ApplicationUser Owner { get; set; }
        public virtual Resource ReplacesResource { get; set; }
        public virtual ICollection<ResourceResourceTag> ResourceResourceTags { get; set; } = new List<ResourceResourceTag>();
        public virtual ICollection<ResourceBookmark> ResourceBookmarks { get; set; } = new List<ResourceBookmark>();
        public virtual ICollection<FileAsset> FileAssets { get; set; } = new List<FileAsset>();
        public virtual ICollection<ResourceComment> Comments { get; set; } = new List<ResourceComment>();
    }
}
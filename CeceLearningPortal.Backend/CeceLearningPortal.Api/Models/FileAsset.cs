using System;
using System.ComponentModel.DataAnnotations;

namespace CeceLearningPortal.Api.Models
{
    public class FileAsset
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string StorageKey { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string OriginalFilename { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string MimeType { get; set; }
        
        public long Size { get; set; }
        
        [MaxLength(255)]
        public string Checksum { get; set; }
        
        [MaxLength(1000)]
        public string CdnUrl { get; set; }
        
        public string OwnerUserId { get; set; }
        
        public Guid? ResourceId { get; set; }
        
        [MaxLength(50)]
        public string UploadStatus { get; set; } = "pending"; // pending, processing, completed, failed
        
        public string ErrorMessage { get; set; }
        
        public string MetadataJson { get; set; } // Will store as JSON
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ApplicationUser Owner { get; set; }
        public virtual Resource Resource { get; set; }
    }
}
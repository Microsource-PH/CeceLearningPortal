using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CeceLearningPortal.Api.Models
{
    public class StudentProfile
    {
        public Guid Id { get; set; }
        
        [Required]
        public string UserId { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string DisplayName { get; set; }
        
        [MaxLength(500)]
        public string Headline { get; set; }
        
        public string About { get; set; }
        
        public List<string> Skills { get; set; } = new List<string>();
        
        [MaxLength(255)]
        public string LocationCity { get; set; }
        
        [MaxLength(255)]
        public string LocationCountry { get; set; }
        
        [MaxLength(100)]
        public string TimeZone { get; set; }
        
        public List<string> Languages { get; set; } = new List<string>();
        
        [MaxLength(500)]
        public string PhotoUrl { get; set; }
        
        // Portfolio and social links
        public string PortfolioLinksJson { get; set; } // Will store as JSON
        
        [MaxLength(500)]
        public string LinkedInUrl { get; set; }
        
        [MaxLength(500)]
        public string TwitterUrl { get; set; }
        
        [MaxLength(500)]
        public string FacebookUrl { get; set; }
        
        [MaxLength(500)]
        public string WebsiteUrl { get; set; }
        
        [MaxLength(500)]
        public string GitHubUrl { get; set; }
        
        // Professional info
        [MaxLength(50)]
        public string Availability { get; set; } = "unavailable"; // open, limited, unavailable
        
        public List<string> Services { get; set; } = new List<string>();
        
        [MaxLength(100)]
        public string HourlyRate { get; set; }
        
        public string CertificationsJson { get; set; } // Will store as JSON
        
        // Privacy and status
        public bool ConsentPublicListing { get; set; } = false;
        
        [MaxLength(50)]
        public string Status { get; set; } = "pending"; // pending, approved, rejected
        
        public string RejectionReason { get; set; }
        
        public string ApprovedById { get; set; }
        
        public DateTime? ApprovedAt { get; set; }
        
        // Metrics
        public int ProfileViews { get; set; } = 0;
        
        public int ContactClicks { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ApplicationUser User { get; set; }
        public virtual ApplicationUser ApprovedBy { get; set; }
    }
}
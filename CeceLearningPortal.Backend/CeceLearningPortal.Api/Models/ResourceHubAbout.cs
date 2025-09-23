using System;
using System.ComponentModel.DataAnnotations;

namespace CeceLearningPortal.Api.Models
{
    public class ResourceHubAbout
    {
        public int Id { get; set; } = 1; // Singleton pattern
        
        [Required]
        [MaxLength(500)]
        public string Title { get; set; } = "About Our Resource Hub";
        
        [MaxLength(1000)]
        public string HeroImageUrl { get; set; }
        
        public string Body { get; set; }
        
        public string CtaButtonsJson { get; set; } // Will store as JSON
        
        public string LastEditedById { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ApplicationUser LastEditedBy { get; set; }
    }
}
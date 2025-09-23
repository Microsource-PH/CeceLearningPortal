using System;
using System.ComponentModel.DataAnnotations;

namespace CeceLearningPortal.Api.Models
{
    public class ResourceBookmark
    {
        [Required]
        public string UserId { get; set; }
        
        [Required]
        public Guid ResourceId { get; set; }
        
        public string Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ApplicationUser User { get; set; }
        public virtual Resource Resource { get; set; }
    }
}
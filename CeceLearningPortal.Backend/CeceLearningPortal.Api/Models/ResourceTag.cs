using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CeceLearningPortal.Api.Models
{
    public class ResourceTag
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Slug { get; set; }
        
        public int UsageCount { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ICollection<ResourceResourceTag> ResourceResourceTags { get; set; } = new List<ResourceResourceTag>();
    }
}
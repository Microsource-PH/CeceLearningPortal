using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CeceLearningPortal.Api.Models
{
    public class ResourceSection
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string Name { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string Slug { get; set; }
        
        public string Description { get; set; }
        
        public int SortOrder { get; set; } = 0;
        
        public bool IsFeatured { get; set; } = false;
        
        [MaxLength(50)]
        public string Access { get; set; } = "students"; // public, students, admins
        
        [MaxLength(500)]
        public string IconUrl { get; set; }
        
        [MaxLength(50)]
        public string Color { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ICollection<Resource> Resources { get; set; } = new List<Resource>();
    }
}
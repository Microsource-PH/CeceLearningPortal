using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CeceLearningPortal.Api.Models
{
    public class ResourceComment
    {
        public Guid Id { get; set; }
        
        public Guid ResourceId { get; set; }
        
        [Required]
        public string UserId { get; set; }
        
        public Guid? ParentCommentId { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        public bool IsEdited { get; set; } = false;
        
        public bool IsDeleted { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual Resource Resource { get; set; }
        public virtual ApplicationUser User { get; set; }
        public virtual ResourceComment ParentComment { get; set; }
        public virtual ICollection<ResourceComment> Replies { get; set; } = new List<ResourceComment>();
    }
}
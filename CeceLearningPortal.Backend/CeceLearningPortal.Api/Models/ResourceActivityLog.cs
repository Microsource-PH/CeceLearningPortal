using System;
using System.ComponentModel.DataAnnotations;

namespace CeceLearningPortal.Api.Models
{
    public class ResourceActivityLog
    {
        public Guid Id { get; set; }
        
        public string ActorUserId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Action { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string TargetType { get; set; }
        
        public Guid? TargetId { get; set; }
        
        public string PayloadJson { get; set; } // Will store as JSON
        
        [MaxLength(45)]
        public string IpAddress { get; set; }
        
        public string UserAgent { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ApplicationUser ActorUser { get; set; }
    }
}
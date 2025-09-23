using System;

namespace CeceLearningPortal.Api.Models
{
    public class ResourceResourceTag
    {
        public Guid ResourceId { get; set; }
        public Guid TagId { get; set; }
        
        // Navigation properties
        public virtual Resource Resource { get; set; }
        public virtual ResourceTag Tag { get; set; }
    }
}
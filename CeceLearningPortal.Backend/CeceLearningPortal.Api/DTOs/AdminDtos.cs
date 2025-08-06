namespace CeceLearningPortal.Api.DTOs
{
    public class UpdateUserRoleDto
    {
        public string Role { get; set; } = string.Empty;
    }

    public class UpdateUserSubscriptionDto
    {
        public string PlanId { get; set; } = string.Empty;
        public bool? IsBilledYearly { get; set; }
    }

    public class RejectCourseDto
    {
        public string Reason { get; set; } = string.Empty;
    }
}
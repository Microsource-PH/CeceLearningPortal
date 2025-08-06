using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CeceLearningPortal.Api.DTOs;

namespace CeceLearningPortal.Api.Services
{
    public interface ISubscriptionPlanService
    {
        Task<List<SubscriptionPlanDto>> GetAllPlansAsync();
        Task<SubscriptionPlanDto?> GetPlanByIdAsync(int id);
        Task<SubscriptionPlanDto> CreatePlanAsync(CreateSubscriptionPlanDto dto);
        Task<SubscriptionPlanDto> UpdatePlanAsync(int id, UpdateSubscriptionPlanDto dto);
        Task<bool> DeletePlanAsync(int id);
        Task<bool> TogglePlanStatusAsync(int id, bool isActive);
    }
}
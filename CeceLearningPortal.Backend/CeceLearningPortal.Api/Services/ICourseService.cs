using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public interface ICourseService
    {
        Task<CourseDto> GetCourseByIdAsync(int id);
        Task<IEnumerable<CourseDto>> GetAllCoursesAsync(CourseFilterDto filter);
        Task<IEnumerable<CourseDto>> GetCoursesByInstructorAsync(string instructorId);
        Task<CourseDto> CreateCourseAsync(CreateCourseDto courseDto, string instructorId);
        Task<CourseDto> UpdateCourseAsync(int id, UpdateCourseDto courseDto, string instructorId);
        Task<bool> DeleteCourseAsync(int id, string instructorId);
        Task<CourseDto> PublishCourseAsync(int id, string instructorId);
        Task<bool> UnpublishCourseAsync(int id, string instructorId);
        Task<IEnumerable<CourseModuleDto>> GetCourseModulesAsync(int courseId);
        Task<CourseModuleDto> CreateModuleAsync(int courseId, CreateModuleDto moduleDto, string instructorId);
        Task<LessonDto> CreateLessonAsync(int moduleId, CreateLessonDto lessonDto, string instructorId);
        Task<CourseStatsDto> GetCourseStatsAsync(int courseId, string instructorId);
    }
}
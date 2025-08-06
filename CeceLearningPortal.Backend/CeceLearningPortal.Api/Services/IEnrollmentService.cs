using CeceLearningPortal.Api.DTOs;

namespace CeceLearningPortal.Api.Services
{
    public interface IEnrollmentService
    {
        Task<EnrollmentDto> EnrollInCourseAsync(int courseId, string studentId);
        Task<IEnumerable<EnrollmentDto>> GetStudentEnrollmentsAsync(string studentId);
        Task<EnrollmentDto> GetEnrollmentAsync(int enrollmentId, string studentId);
        Task<bool> UpdateLessonProgressAsync(int lessonId, string studentId, UpdateLessonProgressDto progressDto);
        Task<LessonProgressDto> GetLessonProgressAsync(int lessonId, string studentId);
        Task<CourseProgressDto> GetCourseProgressAsync(int courseId, string studentId);
        Task<CertificateDto> GenerateCertificateAsync(int courseId, string studentId);
        Task<StudentStatsDto> GetStudentStatsAsync(string studentId);
    }
}
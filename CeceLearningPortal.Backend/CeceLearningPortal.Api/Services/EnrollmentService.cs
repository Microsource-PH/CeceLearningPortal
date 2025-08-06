using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.DTOs;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public class EnrollmentService : IEnrollmentService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EnrollmentService> _logger;

        public EnrollmentService(ApplicationDbContext context, ILogger<EnrollmentService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<EnrollmentDto> EnrollInCourseAsync(int courseId, string studentId)
        {
            // Check if already enrolled
            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == studentId);

            if (existingEnrollment != null)
            {
                throw new InvalidOperationException("Student is already enrolled in this course.");
            }

            var course = await _context.Courses
                .Include(c => c.Instructor)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null)
            {
                throw new InvalidOperationException("Course not found.");
            }

            if (course.Status != CourseStatus.Active)
            {
                throw new InvalidOperationException("Course is not available for enrollment.");
            }

            var enrollment = new Enrollment
            {
                StudentId = studentId,
                CourseId = courseId,
                EnrolledAt = DateTime.UtcNow,
                ProgressPercentage = 0
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            var student = await _context.Users.FindAsync(studentId);

            return new EnrollmentDto
            {
                Id = enrollment.Id,
                StudentId = enrollment.StudentId,
                StudentName = student?.FullName ?? "Unknown",
                CourseId = enrollment.CourseId,
                CourseTitle = course.Title,
                CourseThumbnail = course.Thumbnail,
                InstructorName = course.Instructor?.FullName ?? "Unknown",
                EnrolledAt = enrollment.EnrolledAt,
                CompletedAt = enrollment.CompletedAt,
                ProgressPercentage = enrollment.ProgressPercentage,
                CertificateUrl = enrollment.CertificateUrl
            };
        }

        public async Task<IEnumerable<EnrollmentDto>> GetStudentEnrollmentsAsync(string studentId)
        {
            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                .ThenInclude(c => c.Instructor)
                .Include(e => e.Student)
                .Where(e => e.StudentId == studentId)
                .Select(e => new EnrollmentDto
                {
                    Id = e.Id,
                    StudentId = e.StudentId,
                    StudentName = e.Student.FullName,
                    CourseId = e.CourseId,
                    CourseTitle = e.Course.Title,
                    CourseThumbnail = e.Course.Thumbnail,
                    InstructorName = e.Course.Instructor.FullName,
                    EnrolledAt = e.EnrolledAt,
                    CompletedAt = e.CompletedAt,
                    ProgressPercentage = e.ProgressPercentage,
                    CertificateUrl = e.CertificateUrl
                })
                .ToListAsync();

            return enrollments;
        }

        public async Task<EnrollmentDto> GetEnrollmentAsync(int enrollmentId, string studentId)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.Course)
                .ThenInclude(c => c.Instructor)
                .Include(e => e.Student)
                .FirstOrDefaultAsync(e => e.Id == enrollmentId && e.StudentId == studentId);

            if (enrollment == null) return null;

            return new EnrollmentDto
            {
                Id = enrollment.Id,
                StudentId = enrollment.StudentId,
                StudentName = enrollment.Student.FullName,
                CourseId = enrollment.CourseId,
                CourseTitle = enrollment.Course.Title,
                CourseThumbnail = enrollment.Course.Thumbnail,
                InstructorName = enrollment.Course.Instructor.FullName,
                EnrolledAt = enrollment.EnrolledAt,
                CompletedAt = enrollment.CompletedAt,
                ProgressPercentage = enrollment.ProgressPercentage,
                CertificateUrl = enrollment.CertificateUrl
            };
        }

        public async Task<bool> UpdateLessonProgressAsync(int lessonId, string studentId, UpdateLessonProgressDto progressDto)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Module)
                .ThenInclude(m => m.Course)
                .FirstOrDefaultAsync(l => l.Id == lessonId);

            if (lesson == null) return false;

            // Check if student is enrolled in the course
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == lesson.Module.CourseId && e.StudentId == studentId);

            if (enrollment == null) return false;

            var lessonProgress = await _context.LessonProgresses
                .FirstOrDefaultAsync(lp => lp.LessonId == lessonId && lp.StudentId == studentId);

            if (lessonProgress == null)
            {
                lessonProgress = new LessonProgress
                {
                    StudentId = studentId,
                    LessonId = lessonId,
                    StartedAt = DateTime.UtcNow
                };
                _context.LessonProgresses.Add(lessonProgress);
            }

            lessonProgress.Status = Enum.Parse<ProgressStatus>(progressDto.Status);
            
            if (progressDto.Status == "Completed")
            {
                lessonProgress.CompletedAt = DateTime.UtcNow;
            }

            if (progressDto.QuizScore.HasValue)
            {
                lessonProgress.QuizScore = progressDto.QuizScore.Value;
            }

            if (!string.IsNullOrEmpty(progressDto.AssignmentSubmissionUrl))
            {
                lessonProgress.AssignmentSubmissionUrl = progressDto.AssignmentSubmissionUrl;
            }

            // Update course progress
            await UpdateCourseProgressAsync(enrollment, lesson.Module.CourseId);

            await _context.SaveChangesAsync();
            return true;
        }

        private async Task UpdateCourseProgressAsync(Enrollment enrollment, int courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Modules)
                .ThenInclude(m => m.Lessons)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            var totalLessons = course.Modules.Sum(m => m.Lessons.Count);
            
            var completedLessons = await _context.LessonProgresses
                .Where(lp => lp.StudentId == enrollment.StudentId && 
                            lp.Lesson.Module.CourseId == courseId && 
                            lp.Status == ProgressStatus.Completed)
                .CountAsync();

            enrollment.ProgressPercentage = totalLessons > 0 
                ? (double)completedLessons / totalLessons * 100 
                : 0;

            if (enrollment.ProgressPercentage >= 100)
            {
                enrollment.CompletedAt = DateTime.UtcNow;
            }
        }

        public async Task<LessonProgressDto> GetLessonProgressAsync(int lessonId, string studentId)
        {
            var progress = await _context.LessonProgresses
                .Include(lp => lp.Lesson)
                .FirstOrDefaultAsync(lp => lp.LessonId == lessonId && lp.StudentId == studentId);

            if (progress == null) return null;

            return new LessonProgressDto
            {
                LessonId = progress.LessonId,
                LessonTitle = progress.Lesson.Title,
                Status = progress.Status.ToString(),
                StartedAt = progress.StartedAt,
                CompletedAt = progress.CompletedAt,
                QuizScore = progress.QuizScore,
                AssignmentSubmissionUrl = progress.AssignmentSubmissionUrl
            };
        }

        public async Task<CourseProgressDto> GetCourseProgressAsync(int courseId, string studentId)
        {
            var course = await _context.Courses
                .Include(c => c.Modules)
                .ThenInclude(m => m.Lessons)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null) return null;

            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == studentId);

            if (enrollment == null) return null;

            var moduleProgress = new List<ModuleProgressDto>();

            foreach (var module in course.Modules)
            {
                var lessonProgressList = new List<LessonProgressDto>();
                var completedLessonsInModule = 0;

                foreach (var lesson in module.Lessons)
                {
                    var lessonProgress = await GetLessonProgressAsync(lesson.Id, studentId);
                    
                    if (lessonProgress == null)
                    {
                        lessonProgress = new LessonProgressDto
                        {
                            LessonId = lesson.Id,
                            LessonTitle = lesson.Title,
                            Status = ProgressStatus.NotStarted.ToString()
                        };
                    }
                    else if (lessonProgress.Status == ProgressStatus.Completed.ToString())
                    {
                        completedLessonsInModule++;
                    }

                    lessonProgressList.Add(lessonProgress);
                }

                var moduleDto = new ModuleProgressDto
                {
                    ModuleId = module.Id,
                    ModuleTitle = module.Title,
                    TotalLessons = module.Lessons.Count,
                    CompletedLessons = completedLessonsInModule,
                    Progress = module.Lessons.Count > 0 
                        ? (double)completedLessonsInModule / module.Lessons.Count * 100 
                        : 0,
                    Lessons = lessonProgressList
                };

                moduleProgress.Add(moduleDto);
            }

            return new CourseProgressDto
            {
                CourseId = course.Id,
                CourseTitle = course.Title,
                OverallProgress = enrollment.ProgressPercentage,
                TotalLessons = course.Modules.Sum(m => m.Lessons.Count),
                CompletedLessons = moduleProgress.Sum(m => m.CompletedLessons),
                InProgressLessons = await _context.LessonProgresses
                    .Where(lp => lp.StudentId == studentId && 
                                lp.Lesson.Module.CourseId == courseId && 
                                lp.Status == ProgressStatus.InProgress)
                    .CountAsync(),
                ModuleProgress = moduleProgress
            };
        }

        public async Task<CertificateDto> GenerateCertificateAsync(int courseId, string studentId)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.Course)
                .ThenInclude(c => c.Instructor)
                .Include(e => e.Student)
                .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == studentId);

            if (enrollment == null || !enrollment.CompletedAt.HasValue)
            {
                throw new InvalidOperationException("Course not completed.");
            }

            // Generate certificate ID
            var certificateId = $"CERT-{courseId}-{studentId}-{enrollment.CompletedAt.Value:yyyyMMdd}";
            var certificateUrl = $"/certificates/{certificateId}.pdf"; // In production, generate actual PDF

            enrollment.CertificateUrl = certificateUrl;
            await _context.SaveChangesAsync();

            return new CertificateDto
            {
                StudentName = enrollment.Student.FullName,
                CourseTitle = enrollment.Course.Title,
                InstructorName = enrollment.Course.Instructor.FullName,
                CompletionDate = enrollment.CompletedAt.Value,
                CertificateId = certificateId,
                CertificateUrl = certificateUrl
            };
        }

        public async Task<StudentStatsDto> GetStudentStatsAsync(string studentId)
        {
            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                .Where(e => e.StudentId == studentId)
                .ToListAsync();

            var stats = new StudentStatsDto
            {
                CoursesEnrolled = enrollments.Count,
                CoursesCompleted = enrollments.Count(e => e.CompletedAt.HasValue),
                CoursesInProgress = enrollments.Count(e => !e.CompletedAt.HasValue && e.ProgressPercentage > 0),
                CertificatesEarned = enrollments.Count(e => !string.IsNullOrEmpty(e.CertificateUrl)),
                AverageProgress = enrollments.Any() ? enrollments.Average(e => e.ProgressPercentage) : 0,
                TotalLearningHours = 0, // Would need to calculate from lesson durations
                CoursesByCategory = enrollments
                    .GroupBy(e => e.Course.Category)
                    .ToDictionary(g => g.Key, g => g.Count()),
                RecentActivities = new List<RecentActivityDto>()
            };

            return stats;
        }
    }
}
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Services
{
    public class DataSeederService
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public DataSeederService(ApplicationDbContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task SeedSarahWilsonData()
        {
            // Create Sarah Wilson user if not exists
            var sarahId = "b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c";
            var sarah = await _context.Users.FirstOrDefaultAsync(u => u.Id == sarahId);
            
            if (sarah == null)
            {
                sarah = new User
                {
                    Id = sarahId,
                    Email = "sarah.wilson@example.com",
                    PasswordHash = _passwordHasher.HashPassword("password123"), // Default password
                    FullName = "Sarah Wilson",
                    Role = "Learner",
                    AvatarUrl = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Users.Add(sarah);
            }

            // Create Dr. Sarah Johnson as instructor if not exists
            var instructorId = "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d";
            var instructor = await _context.Users.FirstOrDefaultAsync(u => u.Id == instructorId);
            
            if (instructor == null)
            {
                instructor = new User
                {
                    Id = instructorId,
                    Email = "instructor@example.com",
                    PasswordHash = _passwordHasher.HashPassword("password123"),
                    FullName = "Dr. Sarah Johnson",
                    Role = "Instructor",
                    AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Users.Add(instructor);
            }

            await _context.SaveChangesAsync();

            // Create Computer Vision Fundamentals course if not exists
            var courseId = 2;
            var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
            
            if (course == null)
            {
                course = new Course
                {
                    Id = courseId,
                    Title = "Computer Vision Fundamentals",
                    Description = "Learn the basics of computer vision and image processing",
                    Price = 1999.00m,
                    OriginalPrice = 2499.00m,
                    InstructorId = instructorId,
                    Category = "Computer Vision",
                    Duration = "32 hours",
                    Level = "Beginner",
                    Thumbnail = "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&auto=format",
                    Status = "active",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Courses.Add(course);
                await _context.SaveChangesAsync();
            }

            // Add Sarah Wilson's Premium subscription
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == sarahId && s.Status == "active");
                
            if (subscription == null)
            {
                subscription = new Subscription
                {
                    UserId = sarahId,
                    PlanId = "premium",
                    Status = "active",
                    StartedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddDays(30),
                    Amount = 49.99m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Subscriptions.Add(subscription);
            }

            // Enroll Sarah Wilson in Computer Vision Fundamentals
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == sarahId && e.CourseId == courseId);
                
            if (enrollment == null)
            {
                enrollment = new Enrollment
                {
                    UserId = sarahId,
                    CourseId = courseId,
                    EnrolledAt = DateTime.UtcNow.AddDays(-7),
                    CompletionPercentage = 45,
                    Status = "active",
                    LastAccessedAt = DateTime.UtcNow.AddDays(-1)
                };
                _context.Enrollments.Add(enrollment);
            }

            // Add a transaction record for the subscription
            var hasTransaction = await _context.Payments
                .AnyAsync(p => p.UserId == sarahId && p.Type == "subscription");
                
            if (!hasTransaction)
            {
                var payment = new Payment
                {
                    UserId = sarahId,
                    Amount = 49.99m,
                    Currency = "USD",
                    Status = "paid",
                    Type = "subscription",
                    ReferenceId = $"SUB-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}",
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                };
                _context.Payments.Add(payment);
            }

            await _context.SaveChangesAsync();

            // Create course modules and lessons
            var existingModules = await _context.Modules
                .Where(m => m.CourseId == courseId)
                .ToListAsync();

            if (!existingModules.Any())
            {
                var moduleNames = new[]
                {
                    "Introduction to Computer Vision",
                    "Image Processing Basics",
                    "Feature Detection",
                    "Image Segmentation",
                    "Object Detection",
                    "Face Recognition",
                    "Motion Analysis",
                    "Deep Learning for CV",
                    "Real-world Applications",
                    "Final Project"
                };

                var lessonCount = 0;
                for (int i = 0; i < moduleNames.Length; i++)
                {
                    var module = new Module
                    {
                        CourseId = courseId,
                        Title = $"Module {i + 1}: {moduleNames[i]}",
                        Description = $"Module {i + 1} description",
                        Order = i + 1,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Modules.Add(module);
                    await _context.SaveChangesAsync();

                    // Create 10 lessons per module
                    for (int j = 0; j < 10; j++)
                    {
                        lessonCount++;
                        var lesson = new Lesson
                        {
                            ModuleId = module.Id,
                            Title = $"Lesson {lessonCount}: Topic {j + 1}",
                            Type = j % 3 == 0 ? "quiz" : "video",
                            Duration = j % 3 == 0 ? "15 minutes" : "10 minutes",
                            VideoUrl = j % 3 != 0 ? $"https://example.com/video{lessonCount}" : null,
                            Content = $"Lesson content for lesson {lessonCount}",
                            Order = j + 1,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.Lessons.Add(lesson);
                        await _context.SaveChangesAsync();

                        // Mark first 44 lessons as completed for Sarah Wilson
                        if (lessonCount <= 44)
                        {
                            var progress = new LessonProgress
                            {
                                LessonId = lesson.Id,
                                UserId = sarahId,
                                Status = "Completed",
                                StartedAt = DateTime.UtcNow.AddDays(-7).AddHours(lessonCount * 2),
                                CompletedAt = DateTime.UtcNow.AddDays(-7).AddHours(lessonCount * 2).AddMinutes(30),
                                TimeSpentMinutes = 30,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };
                            _context.LessonProgress.Add(progress);
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
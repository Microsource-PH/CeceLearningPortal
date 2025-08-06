using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.Models;

namespace CeceLearningPortal.Api.Services
{
    public class DataSeederService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<DataSeederService> _logger;

        public DataSeederService(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ILogger<DataSeederService> logger)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        public async Task SeedDataAsync()
        {
            try
            {
                // Check if data already exists
                bool hasData = await _context.Courses.AnyAsync() || 
                              await _context.Enrollments.AnyAsync() || 
                              await _context.Payments.AnyAsync();
                
                if (hasData)
                {
                    _logger.LogInformation("Database already contains data. Checking if data cleanup is needed...");
                    
                    // Check if we should force reseed (e.g., during development)
                    var forceReseed = Environment.GetEnvironmentVariable("FORCE_RESEED") == "true";
                    
                    if (!forceReseed)
                    {
                        _logger.LogInformation("Checking for missing data components...");
                        
                        // Check if subscriptions need to be seeded
                        var hasSubscriptions = await _context.Subscriptions.AnyAsync();
                        if (!hasSubscriptions)
                        {
                            _logger.LogInformation("No subscriptions found. Seeding subscriptions...");
                            await SeedSubscriptionPlansAsync();
                            await SeedActiveSubscriptionsAsync();
                            _logger.LogInformation("Subscriptions seeded successfully.");
                        }
                        
                        return;
                    }
                    
                    _logger.LogWarning("FORCE_RESEED is enabled. Clearing existing data...");
                    
                    // Clear data in correct order to respect foreign key constraints
                    await ClearAllDataAsync();
                }

                _logger.LogInformation("Starting database seeding...");

                // Ensure database is created and migrations are applied
                await _context.Database.MigrateAsync();

                // Seed Roles
                await SeedRolesAsync();

                // Seed Users (Admin, Instructors, initial Students)
                await SeedUsersAsync();

                // Seed Subscription Plans
                await SeedSubscriptionPlansAsync();

                // NEW: Use consistent data seeding approach
                await SeedConsistentDataAsync();
                
                _logger.LogInformation("Database seeding completed successfully!");
                
                // Log summary statistics
                await LogSeedingSummaryAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while seeding data");
                throw;
            }
        }

        private async Task SeedRolesAsync()
        {
            string[] roleNames = { "Admin", "Instructor", "Student" };

            foreach (var roleName in roleNames)
            {
                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    await _roleManager.CreateAsync(new IdentityRole(roleName));
                    _logger.LogInformation($"Created role: {roleName}");
                }
            }
        }

        private async Task SeedUsersAsync()
        {
            // Update demo users with proper passwords
            await CreateOrUpdateUserAsync("admin@example.com", "Admin User", UserRole.Admin, "Admin123", "Admin");
            await CreateOrUpdateUserAsync("instructor@example.com", "Dr. Sarah Johnson", UserRole.Instructor, "Instructor123", "Instructor");
            await CreateOrUpdateUserAsync("student@example.com", "Jane Doe", UserRole.Student, "Student123", "Student");
            
            // Create additional instructors for marketplace
            await CreateOrUpdateUserAsync("michael.chen@example.com", "Prof. Michael Chen", UserRole.Instructor, "Instructor123", "Instructor");
            await CreateOrUpdateUserAsync("emily.davis@example.com", "Emily Davis", UserRole.Instructor, "Instructor123", "Instructor");
        }

        private async Task CreateOrUpdateUserAsync(string email, string fullName, UserRole role, string password, string roleName)
        {
            var existingUser = await _userManager.FindByEmailAsync(email);
            
            if (existingUser != null)
            {
                // Update existing user's password and role
                existingUser.FullName = fullName;
                existingUser.Role = role;
                existingUser.Status = UserStatus.Active;
                
                var token = await _userManager.GeneratePasswordResetTokenAsync(existingUser);
                var result = await _userManager.ResetPasswordAsync(existingUser, token, password);
                
                if (result.Succeeded)
                {
                    await _userManager.UpdateAsync(existingUser);
                    
                    // Ensure user has the correct role
                    var currentRoles = await _userManager.GetRolesAsync(existingUser);
                    await _userManager.RemoveFromRolesAsync(existingUser, currentRoles);
                    await _userManager.AddToRoleAsync(existingUser, roleName);
                    
                    _logger.LogInformation($"Updated user: {email}");
                }
                else
                {
                    _logger.LogError($"Failed to update password for {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
            else
            {
                // Create new user
                var newUser = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FullName = fullName,
                    Role = role,
                    Status = UserStatus.Active,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await _userManager.CreateAsync(newUser, password);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(newUser, roleName);
                    _logger.LogInformation($"Created {roleName.ToLower()} user: {email}");
                }
                else
                {
                    _logger.LogError($"Failed to create user {email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
        }

        private async Task SeedCoursesAsync()
        {
            // Clear existing courses for clean seed
            if (await _context.Courses.AnyAsync())
            {
                _context.Courses.RemoveRange(_context.Courses);
                await _context.SaveChangesAsync();
            }

            var sarahJohnson = await _userManager.FindByEmailAsync("instructor@example.com");
            var michaelChen = await _userManager.FindByEmailAsync("michael.chen@example.com");
            var emilyDavis = await _userManager.FindByEmailAsync("emily.davis@example.com");
            
            if (sarahJohnson == null) return;

            // Dr. Sarah Johnson's courses (Top Performer)
            var sarahCourses = new List<Course>
            {
                new Course
                {
                    Title = "Complete Web Development Bootcamp 2025",
                    Description = "Master modern web development from scratch. Build 20+ projects including React, Node.js, MongoDB and more!",
                    InstructorId = sarahJohnson.Id,
                    Price = 89.99m,
                    OriginalPrice = 199.99m,
                    Discount = 55,
                    Duration = "60 hours",
                    Level = CourseLevel.Beginner,
                    Category = "Web Development",
                    Status = CourseStatus.Active,
                    IsBestseller = true,
                    Features = new List<string> { "60 hours of HD video", "150+ coding exercises", "30+ real-world projects", "Certificate of completion", "Lifetime access" },
                    EnrollmentType = EnrollmentType.OneTime,
                    CreatedAt = DateTime.UtcNow.AddMonths(-6),
                    UpdatedAt = DateTime.UtcNow
                },
                new Course
                {
                    Title = "Advanced React & Redux Masterclass",
                    Description = "Build enterprise-level React applications. Master hooks, context, Redux, testing, and deployment.",
                    InstructorId = sarahJohnson.Id,
                    Price = 79.99m,
                    OriginalPrice = 149.99m,
                    Discount = 47,
                    Duration = "40 hours",
                    Level = CourseLevel.Advanced,
                    Category = "Web Development",
                    Status = CourseStatus.Active,
                    IsBestseller = true,
                    Features = new List<string> { "Advanced patterns", "Performance optimization", "Testing strategies", "CI/CD pipeline", "Production deployment" },
                    EnrollmentType = EnrollmentType.OneTime,
                    CreatedAt = DateTime.UtcNow.AddMonths(-4),
                    UpdatedAt = DateTime.UtcNow
                },
                new Course
                {
                    Title = "Machine Learning with Python & TensorFlow",
                    Description = "Master machine learning algorithms and build AI applications using Python, TensorFlow, and Keras.",
                    InstructorId = sarahJohnson.Id,
                    Price = 99.99m,
                    OriginalPrice = 189.99m,
                    Discount = 47,
                    Duration = "50 hours",
                    Level = CourseLevel.Intermediate,
                    Category = "Data Science",
                    Status = CourseStatus.Active,
                    IsBestseller = true,
                    Features = new List<string> { "Neural networks", "Deep learning", "Computer vision", "NLP projects", "Real datasets" },
                    EnrollmentType = EnrollmentType.OneTime,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    UpdatedAt = DateTime.UtcNow
                },
                new Course
                {
                    Title = "Full Stack JavaScript Developer Path",
                    Description = "Become a full-stack developer. Master JavaScript, React, Node.js, Express, MongoDB, and more.",
                    InstructorId = sarahJohnson.Id,
                    Price = 129.99m,
                    OriginalPrice = 249.99m,
                    Discount = 48,
                    Duration = "80 hours",
                    Level = CourseLevel.Intermediate,
                    Category = "Web Development",
                    Status = CourseStatus.Active,
                    Features = new List<string> { "MERN stack", "GraphQL", "Microservices", "Docker & K8s", "AWS deployment" },
                    EnrollmentType = EnrollmentType.OneTime,
                    CreatedAt = DateTime.UtcNow.AddMonths(-2),
                    UpdatedAt = DateTime.UtcNow
                },
                new Course
                {
                    Title = "Computer Vision Fundamentals",
                    Description = "Learn the fundamentals of computer vision, image processing, and deep learning for visual recognition tasks.",
                    InstructorId = sarahJohnson.Id,
                    Price = 199.99m,
                    OriginalPrice = 299.99m,
                    Discount = 33,
                    Duration = "30 hours",
                    Level = CourseLevel.Intermediate,
                    Category = "Computer Vision",
                    Status = CourseStatus.Active,
                    Features = new List<string> { "OpenCV tutorials", "Deep learning models", "Practical projects", "Real-time processing" },
                    EnrollmentType = EnrollmentType.OneTime,
                    CreatedAt = DateTime.UtcNow.AddMonths(-1),
                    UpdatedAt = DateTime.UtcNow
                }
            };

            // Other instructors' courses
            if (michaelChen != null)
            {
                sarahCourses.Add(new Course
                {
                    Title = "iOS Development with Swift",
                    Description = "Build professional iOS apps with Swift 5 and SwiftUI.",
                    InstructorId = michaelChen.Id,
                    Price = 79.99m,
                    OriginalPrice = 129.99m,
                    Discount = 38,
                    Duration = "35 hours",
                    Level = CourseLevel.Intermediate,
                    Category = "Mobile Development",
                    Status = CourseStatus.Active,
                    Features = new List<string> { "SwiftUI", "Core Data", "App Store deployment" },
                    EnrollmentType = EnrollmentType.OneTime,
                    CreatedAt = DateTime.UtcNow.AddMonths(-2),
                    UpdatedAt = DateTime.UtcNow
                });
            }

            if (emilyDavis != null)
            {
                sarahCourses.Add(new Course
                {
                    Title = "Digital Marketing Fundamentals",
                    Description = "Master digital marketing strategies for business growth.",
                    InstructorId = emilyDavis.Id,
                    Price = 49.99m,
                    OriginalPrice = 89.99m,
                    Discount = 44,
                    Duration = "20 hours",
                    Level = CourseLevel.Beginner,
                    Category = "Marketing",
                    Status = CourseStatus.Active,
                    Features = new List<string> { "SEO strategies", "Social media marketing", "Analytics" },
                    EnrollmentType = EnrollmentType.OneTime,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    UpdatedAt = DateTime.UtcNow
                });
            }

            _context.Courses.AddRange(sarahCourses);
            await _context.SaveChangesAsync();

            // Add detailed modules and lessons for Sarah's top course
            var webDevCourse = sarahCourses.First();
            var modules = new List<CourseModule>
            {
                new CourseModule
                {
                    CourseId = webDevCourse.Id,
                    Title = "Introduction to Web Development",
                    Description = "Get started with the fundamentals",
                    Order = 1,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new CourseModule
                {
                    CourseId = webDevCourse.Id,
                    Title = "HTML5 & CSS3 Mastery",
                    Description = "Build responsive layouts",
                    Order = 2,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new CourseModule
                {
                    CourseId = webDevCourse.Id,
                    Title = "JavaScript From Zero to Hero",
                    Description = "Master modern JavaScript",
                    Order = 3,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            _context.CourseModules.AddRange(modules);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created sample courses with Dr. Sarah Johnson as top instructor");
        }

        private async Task SeedSubscriptionPlansAsync()
        {
            if (await _context.SubscriptionPlans.AnyAsync())
            {
                return; // Subscription plans already seeded
            }

            var subscriptionPlans = new List<SubscriptionPlan>
            {
                // Learner Plans
                new SubscriptionPlan
                {
                    Name = "Free Learner",
                    Description = "Start your learning journey with free courses",
                    PlanType = SubscriptionPlanType.Learner,
                    MonthlyPrice = 0,
                    YearlyPrice = 0,
                    MaxCourseAccess = 3,
                    HasUnlimitedAccess = false,
                    Features = new List<string> { "Access to 3 free courses", "Basic community support", "Course completion certificates", "Mobile app access" },
                    IsActive = true,
                    DisplayOrder = 1,
                    IsRecommended = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new SubscriptionPlan
                {
                    Name = "Basic Learner",
                    Description = "Perfect for casual learners",
                    PlanType = SubscriptionPlanType.Learner,
                    MonthlyPrice = 19.99m,
                    YearlyPrice = 199.99m,
                    MaxCourseAccess = 10,
                    HasUnlimitedAccess = false,
                    Features = new List<string> { "Access to 10 courses per month", "Email support", "Downloadable resources", "Offline viewing", "Progress tracking" },
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new SubscriptionPlan
                {
                    Name = "Premium Learner",
                    Description = "Unlimited learning for serious students",
                    PlanType = SubscriptionPlanType.Learner,
                    MonthlyPrice = 49.99m,
                    YearlyPrice = 499.99m,
                    MaxCourseAccess = -1, // Unlimited
                    HasUnlimitedAccess = true,
                    Features = new List<string> { "Unlimited course access", "Priority email support", "All certificates", "Offline downloads", "Live Q&A sessions", "Early access to new courses" },
                    IsActive = true,
                    DisplayOrder = 2,
                    IsRecommended = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new SubscriptionPlan
                {
                    Name = "Enterprise Learner",
                    Description = "Perfect for teams and organizations",
                    PlanType = SubscriptionPlanType.Learner,
                    MonthlyPrice = 99.99m,
                    YearlyPrice = 999.99m,
                    MaxCourseAccess = -1, // Unlimited
                    HasUnlimitedAccess = true,
                    Features = new List<string> { "Everything in Premium", "Team management dashboard", "Usage analytics", "Custom learning paths", "Dedicated account manager", "Invoice billing" },
                    IsActive = true,
                    DisplayOrder = 3,
                    IsRecommended = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                
                // Creator Plans
                new SubscriptionPlan
                {
                    Name = "Starter Creator",
                    Description = "Start your teaching journey",
                    PlanType = SubscriptionPlanType.Creator,
                    MonthlyPrice = 0,
                    YearlyPrice = 0,
                    MaxCoursesCanCreate = 2,
                    MaxStudentsPerCourse = 50,
                    TransactionFeePercentage = 30, // Platform takes 30%
                    HasAnalytics = false,
                    HasPrioritySupport = false,
                    Features = new List<string> { "Create up to 2 courses", "Up to 50 students per course", "Basic course builder", "Community support", "Monthly payouts" },
                    IsActive = true,
                    DisplayOrder = 4,
                    IsRecommended = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new SubscriptionPlan
                {
                    Name = "Professional Creator",
                    Description = "For serious course creators",
                    PlanType = SubscriptionPlanType.Creator,
                    MonthlyPrice = 29.99m,
                    YearlyPrice = 299.99m,
                    MaxCoursesCanCreate = 10,
                    MaxStudentsPerCourse = 500,
                    TransactionFeePercentage = 20, // Platform takes 20%
                    HasAnalytics = true,
                    HasPrioritySupport = false,
                    Features = new List<string> { "Create up to 10 courses", "Up to 500 students per course", "Advanced analytics", "Custom branding", "Email support", "Weekly payouts" },
                    IsActive = true,
                    DisplayOrder = 5,
                    IsRecommended = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new SubscriptionPlan
                {
                    Name = "Business Creator",
                    Description = "Scale your education business",
                    PlanType = SubscriptionPlanType.Creator,
                    MonthlyPrice = 99.99m,
                    YearlyPrice = 999.99m,
                    MaxCoursesCanCreate = null, // Unlimited
                    MaxStudentsPerCourse = null, // Unlimited
                    TransactionFeePercentage = 10, // Platform takes only 10%
                    HasAnalytics = true,
                    HasPrioritySupport = true,
                    Features = new List<string> { "Unlimited courses", "Unlimited students", "Advanced analytics & insights", "Priority support", "Custom domain", "API access", "Daily payouts", "Co-instructor feature" },
                    IsActive = true,
                    DisplayOrder = 6,
                    IsRecommended = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            _context.SubscriptionPlans.AddRange(subscriptionPlans);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Created subscription plans");
        }

        private async Task SeedStudentsAndEnrollmentsAsync()
        {
            var random = new Random();
            var studentEmails = new[]
            {
                "john.doe@example.com",
                "alice.johnson@example.com",
                "bob.smith@example.com",
                "emma.wilson@example.com",
                "michael.brown@example.com",
                "sophia.davis@example.com",
                "william.garcia@example.com",
                "olivia.martinez@example.com",
                "james.anderson@example.com",
                "isabella.taylor@example.com",
                "david.thomas@example.com",
                "mia.jackson@example.com",
                "robert.white@example.com",
                "charlotte.harris@example.com",
                "joseph.martin@example.com"
            };

            var studentNames = new[]
            {
                "John Doe",
                "Alice Johnson",
                "Bob Smith",
                "Emma Wilson",
                "Michael Brown",
                "Sophia Davis",
                "William Garcia",
                "Olivia Martinez",
                "James Anderson",
                "Isabella Taylor",
                "David Thomas",
                "Mia Jackson",
                "Robert White",
                "Charlotte Harris",
                "Joseph Martin"
            };

            var courses = await _context.Courses.Include(c => c.Instructor).ToListAsync();
            var sarahCourses = courses.Where(c => c.Instructor.Email == "instructor@example.com").ToList();

            // Create students and enroll them in courses
            for (int i = 0; i < studentEmails.Length; i++)
            {
                var email = studentEmails[i];
                var name = studentNames[i];

                var existingStudent = await _userManager.FindByEmailAsync(email);
                ApplicationUser student;
                
                if (existingStudent == null)
                {
                    student = new ApplicationUser
                    {
                        UserName = email,
                        Email = email,
                        FullName = name,
                        Role = UserRole.Student,
                        Status = UserStatus.Active,
                        EmailConfirmed = true,
                        CreatedAt = DateTime.UtcNow.AddMonths(-random.Next(1, 6))
                    };

                    var result = await _userManager.CreateAsync(student, "Password123");
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(student, "Student");
                    }
                    else
                    {
                        continue;
                    }
                }
                else
                {
                    student = existingStudent;
                }

                // Check if student already has enrollments
                var existingEnrollments = await _context.Enrollments
                    .Where(e => e.StudentId == student.Id)
                    .Select(e => e.CourseId)
                    .ToListAsync();

                if (existingEnrollments.Count == 0)
                {
                    // Enroll in 1-3 courses (mostly Sarah's courses to make her top performer)
                    var numberOfCourses = random.Next(1, 4);
                    var selectedCourses = new List<Course>();

                    // 80% chance to enroll in Sarah's courses
                    for (int j = 0; j < numberOfCourses; j++)
                    {
                        Course courseToEnroll;
                        if (random.NextDouble() < 0.8 && sarahCourses.Any())
                        {
                            courseToEnroll = sarahCourses[random.Next(sarahCourses.Count)];
                        }
                        else
                        {
                            courseToEnroll = courses[random.Next(courses.Count)];
                        }

                        if (!selectedCourses.Contains(courseToEnroll) && !existingEnrollments.Contains(courseToEnroll.Id))
                        {
                            selectedCourses.Add(courseToEnroll);

                            var daysAgo = random.Next(1, 180);
                            var enrollment = new Enrollment
                            {
                                StudentId = student.Id,
                                CourseId = courseToEnroll.Id,
                                EnrolledAt = DateTime.UtcNow.AddDays(-daysAgo),
                                ProgressPercentage = random.Next(10, 100)
                            };

                            // Some students complete courses
                            if (enrollment.ProgressPercentage == 100)
                            {
                                enrollment.CompletedAt = enrollment.EnrolledAt.AddDays(random.Next(30, 90));
                                enrollment.CertificateUrl = $"https://certificates.example.com/{Guid.NewGuid()}.pdf";
                            }

                            _context.Enrollments.Add(enrollment);
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Created students and enrollments");
        }

        private async Task SeedReviewsAsync()
        {
            var random = new Random();
            var enrollments = await _context.Enrollments
                .Include(e => e.Student)
                .Include(e => e.Course)
                .ToListAsync();

            var reviewComments = new[]
            {
                "Excellent course! Dr. Johnson explains complex concepts in a simple way.",
                "Best investment in my career. Highly recommended!",
                "Amazing content and great practical examples.",
                "Dr. Sarah Johnson is an outstanding instructor!",
                "This course changed my career path. Thank you!",
                "Very comprehensive and well-structured course.",
                "The projects are challenging but rewarding.",
                "Learned so much from this course. Worth every penny!",
                "Clear explanations and excellent support.",
                "One of the best courses I've taken online."
            };

            foreach (var enrollment in enrollments.Where(e => e.ProgressPercentage > 30))
            {
                // 70% chance to leave a review
                if (random.NextDouble() < 0.7)
                {
                    var existingReview = await _context.Reviews
                        .FirstOrDefaultAsync(r => r.StudentId == enrollment.StudentId && r.CourseId == enrollment.CourseId);

                    if (existingReview == null)
                    {
                        // Higher ratings for Sarah's courses
                        var isSarahCourse = enrollment.Course.Instructor?.Email == "instructor@example.com";
                        var minRating = isSarahCourse ? 4 : 3;
                        var rating = random.Next(minRating, 6); // 4-5 for Sarah, 3-5 for others

                        var review = new Review
                        {
                            StudentId = enrollment.StudentId,
                            CourseId = enrollment.CourseId,
                            Rating = rating,
                            Comment = reviewComments[random.Next(reviewComments.Length)],
                            CreatedAt = enrollment.EnrolledAt.AddDays(random.Next(7, 30)),
                            Status = ReviewStatus.Approved,
                            ApprovedAt = DateTime.UtcNow.AddDays(-random.Next(1, 30)),
                            ApprovedBy = "admin@example.com"
                        };

                        _context.Reviews.Add(review);
                    }
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Created course reviews");
        }

        private async Task SeedPaymentsAsync()
        {
            var random = new Random();
            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                .Include(e => e.Student)
                .ToListAsync();

            var subscriptionPlans = await _context.SubscriptionPlans.ToListAsync();

            foreach (var enrollment in enrollments)
            {
                // Check if payment already exists
                var existingPayment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.UserId == enrollment.StudentId && p.CourseId == enrollment.CourseId);

                if (existingPayment == null)
                {
                    // 30% chance for subscription, 70% for direct purchase
                    if (random.NextDouble() < 0.3 && subscriptionPlans.Any())
                    {
                        // Create subscription payment
                        var plan = subscriptionPlans[random.Next(1, subscriptionPlans.Count)]; // Skip free plan
                        
                        var subscription = new Subscription
                        {
                            UserId = enrollment.StudentId,
                            SubscriptionPlanId = plan.Id,
                            PlanName = plan.Name,
                            Price = plan.MonthlyPrice,
                            BillingCycle = "Monthly",
                            Status = SubscriptionStatus.Active,
                            StartDate = enrollment.EnrolledAt,
                            NextBillingDate = enrollment.EnrolledAt.AddMonths(1),
                            CreatedAt = enrollment.EnrolledAt,
                            UpdatedAt = DateTime.UtcNow
                        };

                        _context.Subscriptions.Add(subscription);
                        await _context.SaveChangesAsync(); // Save subscription first

                        var subscriptionPayment = new Payment
                        {
                            UserId = enrollment.StudentId,
                            SubscriptionId = subscription.Id,
                            Amount = plan.MonthlyPrice,
                            Currency = "USD",
                            Status = PaymentStatus.Completed,
                            PaymentMethod = PaymentMethod.CreditCard,
                            TransactionId = $"sub_{Guid.NewGuid().ToString()[..8]}",
                            CreatedAt = enrollment.EnrolledAt
                        };

                        _context.Payments.Add(subscriptionPayment);
                    }
                    else
                    {
                        // Create direct course purchase payment
                        var payment = new Payment
                        {
                            UserId = enrollment.StudentId,
                            CourseId = enrollment.CourseId,
                            Amount = enrollment.Course.Price,
                            Currency = "USD",
                            Status = PaymentStatus.Completed,
                            PaymentMethod = random.NextDouble() < 0.7 ? PaymentMethod.CreditCard : PaymentMethod.PayPal,
                            TransactionId = $"course_{Guid.NewGuid().ToString()[..8]}",
                            CreatedAt = enrollment.EnrolledAt
                        };

                        _context.Payments.Add(payment);
                    }
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Created payment records for analytics");
        }

        private async Task SeedConsistentDataAsync()
        {
            _logger.LogInformation("Starting consistent data seeding...");
            
            // 1. Create instructors with specific characteristics
            var instructors = new List<(string email, string name, int courseCount, decimal avgPrice, double avgRating)>
            {
                ("instructor@example.com", "Dr. Sarah Johnson", 5, 109.99m, 4.85),
                ("michael.chen@example.com", "Prof. Michael Chen", 4, 89.99m, 4.75),
                ("emily.davis@example.com", "Emily Davis", 3, 79.99m, 4.65)
            };
            
            // 2. Seed additional users with different statuses
            await SeedUsersWithVariousStatusesAsync();
            
            // 3. Seed courses with consistent pricing and student distribution
            await SeedCoursesWithConsistentDataAsync();
            
            // 4. Seed courses with different statuses (draft, pending review, etc.)
            await SeedCoursesWithVariousStatusesAsync();
            
            // 5. Seed enrollments with realistic distribution
            await SeedRealisticEnrollmentsAsync();
            
            // 6. Seed reviews with consistent ratings
            await SeedConsistentReviewsAsync();
            
            // 7. Seed payments for all enrollments
            await SeedCompletePaymentsAsync();
            
            // 8. Seed active subscriptions for users
            await SeedActiveSubscriptionsAsync();
            
            _logger.LogInformation("Consistent data seeding completed");
        }

        private async Task SeedCoursesWithConsistentDataAsync()
        {
            var sarahJohnson = await _userManager.FindByEmailAsync("instructor@example.com");
            var michaelChen = await _userManager.FindByEmailAsync("michael.chen@example.com");
            var emilyDavis = await _userManager.FindByEmailAsync("emily.davis@example.com");
            
            if (sarahJohnson == null) return;
            
            // Clear existing data in the correct order to respect foreign key constraints
            // First remove lessons (depend on modules)
            _context.Lessons.RemoveRange(_context.Lessons);
            await _context.SaveChangesAsync();
            
            // Remove modules (depend on courses)
            _context.CourseModules.RemoveRange(_context.CourseModules);
            await _context.SaveChangesAsync();
            
            // Remove payments (depend on courses)
            _context.Payments.RemoveRange(_context.Payments);
            await _context.SaveChangesAsync();
            
            // Remove reviews (depend on courses)
            _context.Reviews.RemoveRange(_context.Reviews);
            await _context.SaveChangesAsync();
            
            // Remove enrollments (depend on courses)
            _context.Enrollments.RemoveRange(_context.Enrollments);
            await _context.SaveChangesAsync();
            
            // Now we can safely remove courses
            _context.Courses.RemoveRange(_context.Courses);
            await _context.SaveChangesAsync();
            
            var courses = new List<Course>();
            
            // Dr. Sarah Johnson's courses - Top performer with consistent high enrollment
            courses.AddRange(new[]
            {
                new Course
                {
                    Title = "Complete Web Development Bootcamp 2025",
                    Description = "Master modern web development from scratch. Build 20+ projects including React, Node.js, MongoDB and more!",
                    InstructorId = sarahJohnson.Id,
                    Price = 89.99m,
                    OriginalPrice = 199.99m,
                    Discount = 55,
                    Duration = "60 hours",
                    Category = "Web Development",
                    Level = CourseLevel.Beginner,
                    Status = CourseStatus.Active,
                    IsBestseller = true,
                    Features = new List<string> { "60 hours of HD video", "150+ coding exercises", "30+ real-world projects", "Certificate of completion", "Lifetime access" },
                    EnrollmentType = EnrollmentType.OneTime,
                    CreatedAt = DateTime.UtcNow.AddMonths(-6),
                    UpdatedAt = DateTime.UtcNow
                },
                new Course
                {
                    Title = "Advanced React & Redux Masterclass",
                    Description = "Build enterprise-level React applications. Master hooks, context, Redux, testing, and deployment.",
                    InstructorId = sarahJohnson.Id,
                    Price = 99.99m,
                    OriginalPrice = 149.99m,
                    Discount = 33,
                    Duration = "40 hours",
                    Category = "Web Development",
                    Level = CourseLevel.Advanced,
                    Status = CourseStatus.Active,
                    IsBestseller = true,
                    Features = new List<string> { "Advanced patterns", "Performance optimization", "Testing strategies", "CI/CD pipeline", "Production deployment" },
                    EnrollmentType = EnrollmentType.OneTime,
                    CreatedAt = DateTime.UtcNow.AddMonths(-5),
                    UpdatedAt = DateTime.UtcNow
                },
                new Course
                {
                    Title = "Machine Learning with Python & TensorFlow",
                    Description = "Master machine learning algorithms and build AI applications using Python, TensorFlow, and Keras.",
                    InstructorId = sarahJohnson.Id,
                    Price = 119.99m,
                    OriginalPrice = 189.99m,
                    Discount = 37,
                    Duration = "50 hours",
                    Category = "Data Science",
                    Level = CourseLevel.Intermediate,
                    Status = CourseStatus.Active,
                    IsBestseller = true,
                    Features = new List<string> { "Neural networks", "Deep learning", "Computer vision", "NLP projects", "Real datasets" },
                    EnrollmentType = EnrollmentType.OneTime,
                    CreatedAt = DateTime.UtcNow.AddMonths(-4),
                    UpdatedAt = DateTime.UtcNow
                },
                new Course
                {
                    Title = "Full Stack JavaScript Developer Path",
                    Description = "Become a full-stack developer. Master JavaScript, React, Node.js, Express, MongoDB, and more.",
                    InstructorId = sarahJohnson.Id,
                    Price = 129.99m,
                    OriginalPrice = 249.99m,
                    Discount = 48,
                    Duration = "80 hours",
                    Category = "Web Development",
                    Level = CourseLevel.Intermediate,
                    Status = CourseStatus.Active,
                    Features = new List<string> { "MERN stack", "GraphQL", "Microservices", "Docker & K8s", "AWS deployment" },
                    EnrollmentType = EnrollmentType.OneTime,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    UpdatedAt = DateTime.UtcNow
                },
                new Course
                {
                    Title = "Computer Vision Fundamentals",
                    Description = "Learn the fundamentals of computer vision, image processing, and deep learning for visual recognition tasks.",
                    InstructorId = sarahJohnson.Id,
                    Price = 149.99m,
                    OriginalPrice = 299.99m,
                    Discount = 50,
                    Duration = "30 hours",
                    Category = "Computer Vision",
                    Level = CourseLevel.Advanced,
                    Status = CourseStatus.Active,
                    Features = new List<string> { "OpenCV tutorials", "Deep learning models", "Practical projects", "Real-time processing" },
                    EnrollmentType = EnrollmentType.OneTime,
                    CreatedAt = DateTime.UtcNow.AddMonths(-2),
                    UpdatedAt = DateTime.UtcNow
                }
            });
            
            // Prof. Michael Chen's courses
            if (michaelChen != null)
            {
                courses.AddRange(new[]
                {
                    new Course
                    {
                        Title = "iOS Development with Swift",
                        Description = "Build professional iOS applications using Swift and SwiftUI. From basics to App Store deployment.",
                        InstructorId = michaelChen.Id,
                        Price = 79.99m,
                        OriginalPrice = 149.99m,
                        Discount = 47,
                        Duration = "45 hours",
                        Category = "Mobile Development",
                        Level = CourseLevel.Beginner,
                        Status = CourseStatus.Active,
                        Features = new List<string> { "SwiftUI fundamentals", "Core Data", "API integration", "App Store deployment" },
                        EnrollmentType = EnrollmentType.OneTime,
                        CreatedAt = DateTime.UtcNow.AddMonths(-5),
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Course
                    {
                        Title = "Android Development Masterclass",
                        Description = "Master Android development with Kotlin. Build modern, scalable Android applications.",
                        InstructorId = michaelChen.Id,
                        Price = 89.99m,
                        OriginalPrice = 159.99m,
                        Discount = 44,
                        Duration = "50 hours",
                        Category = "Mobile Development",
                        Level = CourseLevel.Intermediate,
                        Status = CourseStatus.Active,
                        Features = new List<string> { "Kotlin essentials", "Jetpack Compose", "MVVM architecture", "Google Play deployment" },
                        EnrollmentType = EnrollmentType.OneTime,
                        CreatedAt = DateTime.UtcNow.AddMonths(-4),
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Course
                    {
                        Title = "Flutter & Dart Complete Guide",
                        Description = "Build beautiful cross-platform mobile apps with Flutter and Dart.",
                        InstructorId = michaelChen.Id,
                        Price = 99.99m,
                        OriginalPrice = 179.99m,
                        Discount = 44,
                        Duration = "60 hours",
                        Category = "Mobile Development",
                        Level = CourseLevel.Intermediate,
                        Status = CourseStatus.Active,
                        Features = new List<string> { "Flutter widgets", "State management", "Firebase integration", "Cross-platform deployment" },
                        EnrollmentType = EnrollmentType.OneTime,
                        CreatedAt = DateTime.UtcNow.AddMonths(-3),
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Course
                    {
                        Title = "React Native Development",
                        Description = "Build native mobile apps using React Native and JavaScript.",
                        InstructorId = michaelChen.Id,
                        Price = 89.99m,
                        OriginalPrice = 169.99m,
                        Discount = 47,
                        Duration = "40 hours",
                        Category = "Mobile Development",
                        Level = CourseLevel.Intermediate,
                        Status = CourseStatus.Active,
                        Features = new List<string> { "React Native basics", "Navigation", "Native modules", "App deployment" },
                        EnrollmentType = EnrollmentType.OneTime,
                        CreatedAt = DateTime.UtcNow.AddMonths(-2),
                        UpdatedAt = DateTime.UtcNow
                    }
                });
            }
            
            // Emily Davis's courses
            if (emilyDavis != null)
            {
                courses.AddRange(new[]
                {
                    new Course
                    {
                        Title = "Digital Marketing Fundamentals",
                        Description = "Learn the essentials of digital marketing including SEO, SEM, social media, and analytics.",
                        InstructorId = emilyDavis.Id,
                        Price = 69.99m,
                        OriginalPrice = 129.99m,
                        Discount = 46,
                        Duration = "25 hours",
                        Category = "Marketing",
                        Level = CourseLevel.Beginner,
                        Status = CourseStatus.Active,
                        Features = new List<string> { "SEO basics", "Google Analytics", "Social media strategy", "Email marketing" },
                        EnrollmentType = EnrollmentType.OneTime,
                        CreatedAt = DateTime.UtcNow.AddMonths(-4),
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Course
                    {
                        Title = "SEO & Content Marketing Strategy",
                        Description = "Master search engine optimization and content marketing to drive organic traffic.",
                        InstructorId = emilyDavis.Id,
                        Price = 79.99m,
                        OriginalPrice = 139.99m,
                        Discount = 43,
                        Duration = "30 hours",
                        Category = "Marketing",
                        Level = CourseLevel.Intermediate,
                        Status = CourseStatus.Active,
                        Features = new List<string> { "Keyword research", "Content optimization", "Link building", "Analytics tracking" },
                        EnrollmentType = EnrollmentType.OneTime,
                        CreatedAt = DateTime.UtcNow.AddMonths(-3),
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Course
                    {
                        Title = "Social Media Marketing Mastery",
                        Description = "Build and execute successful social media marketing campaigns across all major platforms.",
                        InstructorId = emilyDavis.Id,
                        Price = 89.99m,
                        OriginalPrice = 159.99m,
                        Discount = 44,
                        Duration = "35 hours",
                        Category = "Marketing",
                        Level = CourseLevel.Advanced,
                        Status = CourseStatus.Active,
                        Features = new List<string> { "Platform strategies", "Content creation", "Paid advertising", "ROI measurement" },
                        EnrollmentType = EnrollmentType.OneTime,
                        CreatedAt = DateTime.UtcNow.AddMonths(-2),
                        UpdatedAt = DateTime.UtcNow
                    }
                });
            }
            
            _context.Courses.AddRange(courses);
            await _context.SaveChangesAsync();
            
            // Seed modules and lessons for each course
            await SeedCourseModulesAsync(courses);
            
            _logger.LogInformation($"Created {courses.Count} courses with consistent data");
        }

        private async Task SeedRealisticEnrollmentsAsync()
        {
            var random = new Random(42); // Fixed seed for consistency
            var courses = await _context.Courses.Include(c => c.Instructor).ToListAsync();
            var students = await _userManager.GetUsersInRoleAsync("Student");
            
            if (!students.Any())
            {
                // Create students if none exist
                await CreateStudentsAsync();
                students = await _userManager.GetUsersInRoleAsync("Student");
            }
            
            var enrollments = new List<Enrollment>();
            
            foreach (var course in courses)
            {
                // Determine enrollment count based on instructor
                int enrollmentCount = course.Instructor.Email switch
                {
                    "instructor@example.com" => random.Next(180, 250), // Sarah gets 180-250 students per course
                    "michael.chen@example.com" => random.Next(120, 180), // Michael gets 120-180 students
                    "emily.davis@example.com" => random.Next(80, 120), // Emily gets 80-120 students
                    _ => random.Next(50, 100)
                };
                
                // Select random students for enrollment
                var selectedStudents = students.OrderBy(x => random.Next()).Take(enrollmentCount).ToList();
                
                foreach (var student in selectedStudents)
                {
                    var enrolledDaysAgo = random.Next(1, 180);
                    var progressPercentage = Math.Min(100, random.Next(0, 100 + (enrolledDaysAgo / 2))); // Older enrollments have higher progress
                    
                    var enrollment = new Enrollment
                    {
                        StudentId = student.Id,
                        CourseId = course.Id,
                        EnrolledAt = DateTime.UtcNow.AddDays(-enrolledDaysAgo),
                        ProgressPercentage = progressPercentage,
                        CompletedAt = progressPercentage == 100 ? DateTime.UtcNow.AddDays(-random.Next(1, 30)) : null
                    };
                    
                    enrollments.Add(enrollment);
                }
            }
            
            _context.Enrollments.AddRange(enrollments);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Created {enrollments.Count} enrollments with realistic distribution");
        }

        private async Task SeedConsistentReviewsAsync()
        {
            var random = new Random(42);
            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                .ThenInclude(c => c.Instructor)
                .Where(e => e.ProgressPercentage >= 30) // Only students with 30%+ progress leave reviews
                .ToListAsync();
            
            var reviews = new List<Review>();
            
            foreach (var enrollment in enrollments)
            {
                // 70% chance of leaving a review
                if (random.NextDouble() < 0.7)
                {
                    // Rating based on instructor
                    int minRating = enrollment.Course.Instructor.Email switch
                    {
                        "instructor@example.com" => 4, // Sarah gets 4-5 stars
                        "michael.chen@example.com" => 4, // Michael gets 4-5 stars
                        "emily.davis@example.com" => 3, // Emily gets 3-5 stars
                        _ => 3
                    };
                    
                    // Weight towards higher ratings
                    var rating = random.NextDouble() < 0.8 ? 5 : random.Next(minRating, 5);
                    
                    var review = new Review
                    {
                        StudentId = enrollment.StudentId,
                        CourseId = enrollment.CourseId,
                        Rating = rating,
                        Comment = GetReviewComment(rating, enrollment.Course.Title),
                        CreatedAt = enrollment.EnrolledAt.AddDays(random.Next(7, 30)),
                        Status = ReviewStatus.Approved,
                        ApprovedAt = DateTime.UtcNow.AddDays(-random.Next(1, 20)),
                        ApprovedBy = "admin@example.com"
                    };
                    
                    reviews.Add(review);
                }
            }
            
            _context.Reviews.AddRange(reviews);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Created {reviews.Count} consistent reviews");
        }

        private async Task SeedCompletePaymentsAsync()
        {
            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                .ToListAsync();
            
            var payments = new List<Payment>();
            
            foreach (var enrollment in enrollments)
            {
                var payment = new Payment
                {
                    UserId = enrollment.StudentId,
                    CourseId = enrollment.CourseId,
                    Amount = enrollment.Course.Price,
                    Currency = "USD",
                    Status = PaymentStatus.Completed,
                    PaymentMethod = PaymentMethod.CreditCard,
                    TransactionId = $"txn_{Guid.NewGuid().ToString()[..8]}",
                    CreatedAt = enrollment.EnrolledAt.AddMinutes(-30) // Payment 30 minutes before enrollment
                };
                
                payments.Add(payment);
            }
            
            _context.Payments.AddRange(payments);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Created {payments.Count} payment records for all enrollments");
        }

        private async Task CreateStudentsAsync()
        {
            var studentCount = 500; // Create 500 students
            var random = new Random(42);
            
            for (int i = 1; i <= studentCount; i++)
            {
                var firstName = GetRandomFirstName(random);
                var lastName = GetRandomLastName(random);
                var email = $"{firstName.ToLower()}.{lastName.ToLower()}{i}@example.com";
                
                var student = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FullName = $"{firstName} {lastName}",
                    Role = UserRole.Student,
                    Status = UserStatus.Active,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-random.Next(30, 365))
                };
                
                var result = await _userManager.CreateAsync(student, "Student123");
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(student, "Student");
                }
            }
            
            _logger.LogInformation($"Created {studentCount} student accounts");
        }

        private string GetReviewComment(int rating, string courseTitle)
        {
            var comments = rating switch
            {
                5 => new[]
                {
                    $"Excellent course! {courseTitle} exceeded all my expectations.",
                    $"Best investment in my career. {courseTitle} is amazing!",
                    "The instructor explains everything so clearly. Highly recommended!",
                    "Comprehensive content and great practical examples throughout.",
                    "This course changed my career trajectory. Thank you!"
                },
                4 => new[]
                {
                    $"Great course overall. {courseTitle} covers all the important topics.",
                    "Very good content, just needs a few more examples.",
                    "Learned a lot from this course. Worth the investment.",
                    "Good pacing and clear explanations throughout."
                },
                3 => new[]
                {
                    "Decent course but could use more depth in some areas.",
                    "Good for beginners, might want more advanced topics.",
                    "Solid foundation but needs updating in some sections."
                },
                _ => new[] { "Course content needs improvement." }
            };
            
            var random = new Random();
            return comments[random.Next(comments.Length)];
        }

        private string GetRandomFirstName(Random random)
        {
            var names = new[] { "John", "Jane", "Michael", "Sarah", "David", "Emma", "James", "Lisa", "Robert", "Mary",
                               "William", "Jennifer", "Richard", "Linda", "Joseph", "Patricia", "Thomas", "Barbara", "Charles", "Elizabeth" };
            return names[random.Next(names.Length)];
        }

        private string GetRandomLastName(Random random)
        {
            var names = new[] { "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                               "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin" };
            return names[random.Next(names.Length)];
        }

        private async Task ClearAllDataAsync()
        {
            _logger.LogInformation("Clearing all data in correct order...");
            
            // Clear in order to respect foreign key constraints
            _context.Payments.RemoveRange(_context.Payments);
            await _context.SaveChangesAsync();
            
            _context.Reviews.RemoveRange(_context.Reviews);
            await _context.SaveChangesAsync();
            
            _context.Enrollments.RemoveRange(_context.Enrollments);
            await _context.SaveChangesAsync();
            
            _context.CourseModules.RemoveRange(_context.CourseModules);
            await _context.SaveChangesAsync();
            
            _context.Courses.RemoveRange(_context.Courses);
            await _context.SaveChangesAsync();
            
            _context.Subscriptions.RemoveRange(_context.Subscriptions);
            await _context.SaveChangesAsync();
            
            _context.InstructorApprovals.RemoveRange(_context.InstructorApprovals);
            await _context.SaveChangesAsync();
            
            _context.CourseApprovals.RemoveRange(_context.CourseApprovals);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("All data cleared successfully");
        }

        private async Task LogSeedingSummaryAsync()
        {
            var instructorStats = await _context.Users
                .Where(u => u.Role == UserRole.Instructor)
                .Select(u => new
                {
                    Name = u.FullName,
                    Email = u.Email,
                    CourseCount = _context.Courses.Count(c => c.InstructorId == u.Id),
                    StudentCount = _context.Enrollments.Count(e => e.Course.InstructorId == u.Id),
                    Revenue = _context.Payments
                        .Where(p => p.Course.InstructorId == u.Id && p.Status == PaymentStatus.Completed)
                        .Sum(p => p.Amount),
                    AvgRating = _context.Reviews
                        .Where(r => r.Course.InstructorId == u.Id)
                        .Average(r => (double?)r.Rating) ?? 0
                })
                .ToListAsync();

            _logger.LogInformation("=== Seeding Summary ===");
            _logger.LogInformation($"Total Students: {await _context.Users.CountAsync(u => u.Role == UserRole.Student)}");
            _logger.LogInformation($"Total Instructors: {await _context.Users.CountAsync(u => u.Role == UserRole.Instructor)}");
            _logger.LogInformation($"Total Courses: {await _context.Courses.CountAsync()}");
            _logger.LogInformation($"Total Enrollments: {await _context.Enrollments.CountAsync()}");
            _logger.LogInformation($"Total Payments: {await _context.Payments.CountAsync(p => p.Status == PaymentStatus.Completed)}");
            _logger.LogInformation($"Total Revenue: ${await _context.Payments.Where(p => p.Status == PaymentStatus.Completed).SumAsync(p => p.Amount):F2}");
            
            foreach (var instructor in instructorStats.OrderByDescending(i => i.Revenue))
            {
                _logger.LogInformation($"\nInstructor: {instructor.Name} ({instructor.Email})");
                _logger.LogInformation($"  Courses: {instructor.CourseCount}");
                _logger.LogInformation($"  Students: {instructor.StudentCount}");
                _logger.LogInformation($"  Revenue: ${instructor.Revenue:F2}");
                _logger.LogInformation($"  Creator Earnings (80%): ${(double)instructor.Revenue * 0.8:F2}");
                _logger.LogInformation($"  Platform Share (20%): ${(double)instructor.Revenue * 0.2:F2}");
                _logger.LogInformation($"  Average Rating: {instructor.AvgRating:F2}");
            }
        }

        private async Task SeedUsersWithVariousStatusesAsync()
        {
            // Create users with pending approval status
            var pendingUsers = new[]
            {
                ("pending.student1@example.com", "Alex Thompson", UserRole.Student, UserStatus.PendingApproval),
                ("pending.student2@example.com", "Maria Rodriguez", UserRole.Student, UserStatus.PendingApproval),
                ("pending.instructor1@example.com", "Dr. James Wilson", UserRole.Instructor, UserStatus.PendingApproval),
                ("pending.instructor2@example.com", "Prof. Lisa Chen", UserRole.Instructor, UserStatus.PendingApproval),
                ("suspended.user@example.com", "John Suspended", UserRole.Student, UserStatus.Suspended),
                ("inactive.user@example.com", "Jane Inactive", UserRole.Student, UserStatus.Inactive)
            };

            foreach (var (email, name, role, status) in pendingUsers)
            {
                var existingUser = await _userManager.FindByEmailAsync(email);
                if (existingUser == null)
                {
                    var user = new ApplicationUser
                    {
                        UserName = email,
                        Email = email,
                        FullName = name,
                        Role = role,
                        Status = status,
                        EmailConfirmed = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30))
                    };

                    var result = await _userManager.CreateAsync(user, "TempPass123!");
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(user, role.ToString());
                        _logger.LogInformation($"Created {status} user: {email}");
                    }
                }
            }

            // Create instructor approval requests for pending instructors
            var pendingInstructors = await _context.Users
                .Where(u => u.Role == UserRole.Instructor && u.Status == UserStatus.PendingApproval)
                .ToListAsync();

            foreach (var instructor in pendingInstructors)
            {
                if (!await _context.InstructorApprovals.AnyAsync(a => a.UserId == instructor.Id))
                {
                    var approval = new InstructorApproval
                    {
                        UserId = instructor.Id,
                        Bio = $"Experienced educator with {Random.Shared.Next(5, 20)} years of teaching experience.",
                        Qualifications = "PhD in Computer Science, Masters in Education",
                        TeachingExperience = $"{Random.Shared.Next(5, 20)} years of university teaching, published author",
                        LinkedInProfile = $"https://linkedin.com/in/{instructor.Email.Split('@')[0]}",
                        Status = ApprovalStatus.Pending,
                        SubmittedAt = instructor.CreatedAt
                    };
                    _context.InstructorApprovals.Add(approval);
                }
            }
            await _context.SaveChangesAsync();
        }

        private async Task SeedCoursesWithVariousStatusesAsync()
        {
            var instructors = await _context.Users
                .Where(u => u.Role == UserRole.Instructor && u.Status == UserStatus.Active)
                .ToListAsync();

            if (!instructors.Any()) return;

            var courseStatuses = new[]
            {
                (CourseStatus.Draft, "Draft Course: Machine Learning Fundamentals", 149.99m),
                (CourseStatus.Draft, "Draft Course: Blockchain Development", 199.99m),
                (CourseStatus.Inactive, "Inactive Course: Legacy PHP Development", 49.99m),
                (CourseStatus.Inactive, "Inactive Course: Flash Game Development", 29.99m)
            };

            foreach (var (status, title, price) in courseStatuses)
            {
                if (!await _context.Courses.AnyAsync(c => c.Title == title))
                {
                    var instructor = instructors[Random.Shared.Next(instructors.Count)];
                    var course = new Course
                    {
                        Title = title,
                        Description = $"This is a {status.ToString().ToLower()} course for testing purposes.",
                        InstructorId = instructor.Id,
                        Price = price,
                        Duration = $"{Random.Shared.Next(10, 50)} hours",
                        Level = (CourseLevel)Random.Shared.Next(0, 4),
                        Category = "Technology",
                        Status = status,
                        Features = new List<string> { "Video content", "Assignments", "Certificate" },
                        CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(30, 365)),
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Courses.Add(course);
                }
            }
            await _context.SaveChangesAsync();
            _logger.LogInformation("Created courses with various statuses");
        }

        private async Task SeedActiveSubscriptionsAsync()
        {
            var plans = await _context.SubscriptionPlans.ToListAsync();
            var users = await _context.Users.Where(u => u.Status == UserStatus.Active).ToListAsync();
            var random = new Random();

            // List to hold subscriptions and their associated payment info
            var subscriptionsWithPayments = new List<(Subscription subscription, decimal price)>();

            // Create subscriptions for students
            var students = users.Where(u => u.Role == UserRole.Student).ToList();
            var learnerPlans = plans.Where(p => p.PlanType == SubscriptionPlanType.Learner && p.IsActive).ToList();

            foreach (var student in students.Take(10)) // Give first 10 students subscriptions
            {
                if (!await _context.Subscriptions.AnyAsync(s => s.UserId == student.Id && s.Status == SubscriptionStatus.Active))
                {
                    var plan = learnerPlans[random.Next(learnerPlans.Count)];
                    var billingCycle = random.Next(2) == 0 ? "Monthly" : "Yearly";
                    var price = billingCycle == "Monthly" ? plan.MonthlyPrice : plan.YearlyPrice;
                    
                    var subscription = new Subscription
                    {
                        UserId = student.Id,
                        SubscriptionPlanId = plan.Id,
                        PlanName = plan.Name,
                        Price = price,
                        BillingCycle = billingCycle,
                        Status = SubscriptionStatus.Active,
                        StartDate = DateTime.UtcNow.AddDays(-random.Next(30, 180)),
                        NextBillingDate = DateTime.UtcNow.AddDays(random.Next(1, 30)),
                        StripeSubscriptionId = $"sub_test_{Guid.NewGuid().ToString("N").Substring(0, 14)}"
                    };
                    _context.Subscriptions.Add(subscription);
                    subscriptionsWithPayments.Add((subscription, price));
                }
            }

            // Create subscriptions for instructors
            var instructors = users.Where(u => u.Role == UserRole.Instructor).ToList();
            var creatorPlans = plans.Where(p => p.PlanType == SubscriptionPlanType.Creator && p.IsActive).ToList();

            foreach (var instructor in instructors)
            {
                if (!await _context.Subscriptions.AnyAsync(s => s.UserId == instructor.Id && s.Status == SubscriptionStatus.Active))
                {
                    var plan = creatorPlans[random.Next(creatorPlans.Count)];
                    var billingCycle = "Monthly"; // Creators typically pay monthly
                    var price = plan.MonthlyPrice;
                    
                    var subscription = new Subscription
                    {
                        UserId = instructor.Id,
                        SubscriptionPlanId = plan.Id,
                        PlanName = plan.Name,
                        Price = price,
                        BillingCycle = billingCycle,
                        Status = SubscriptionStatus.Active,
                        StartDate = DateTime.UtcNow.AddDays(-random.Next(60, 365)),
                        NextBillingDate = DateTime.UtcNow.AddDays(random.Next(1, 30)),
                        StripeSubscriptionId = $"sub_test_{Guid.NewGuid().ToString("N").Substring(0, 14)}"
                    };
                    _context.Subscriptions.Add(subscription);
                    
                    if (price > 0) // Only create payment if not free plan
                    {
                        subscriptionsWithPayments.Add((subscription, price));
                    }
                }
            }

            // Create some cancelled subscriptions for history
            for (int i = 0; i < 5; i++)
            {
                var student = students[random.Next(students.Count)];
                var plan = learnerPlans[random.Next(learnerPlans.Count)];
                var startDate = DateTime.UtcNow.AddDays(-random.Next(180, 365));
                var endDate = startDate.AddDays(random.Next(30, 90));
                
                var cancelledSub = new Subscription
                {
                    UserId = student.Id,
                    SubscriptionPlanId = plan.Id,
                    PlanName = plan.Name,
                    Price = plan.MonthlyPrice,
                    BillingCycle = "Monthly",
                    Status = SubscriptionStatus.Cancelled,
                    StartDate = startDate,
                    EndDate = endDate,
                    StripeSubscriptionId = $"sub_test_{Guid.NewGuid().ToString("N").Substring(0, 14)}"
                };
                _context.Subscriptions.Add(cancelledSub);
            }

            // Save all subscriptions first
            await _context.SaveChangesAsync();
            
            // Now create payments for the saved subscriptions
            foreach (var (subscription, price) in subscriptionsWithPayments)
            {
                var payment = new Payment
                {
                    UserId = subscription.UserId,
                    SubscriptionId = subscription.Id,
                    Amount = price,
                    Currency = "USD",
                    Status = PaymentStatus.Completed,
                    PaymentMethod = PaymentMethod.CreditCard,
                    TransactionId = $"txn_test_{Guid.NewGuid().ToString("N").Substring(0, 14)}",
                    PaymentIntentId = $"pi_test_{Guid.NewGuid().ToString("N").Substring(0, 14)}",
                    CreatedAt = subscription.StartDate,
                    ProcessedAt = subscription.StartDate
                };
                _context.Payments.Add(payment);
            }
            
            await _context.SaveChangesAsync();
            _logger.LogInformation("Created active subscriptions and payments for users");
        }

        private async Task SeedCourseModulesAsync(List<Course> courses)
        {
            _logger.LogInformation("Seeding course modules and lessons...");

            foreach (var course in courses)
            {
                // Clear existing modules for this course
                var existingModules = await _context.CourseModules
                    .Where(m => m.CourseId == course.Id)
                    .ToListAsync();
                if (existingModules.Any())
                {
                    _context.CourseModules.RemoveRange(existingModules);
                    await _context.SaveChangesAsync();
                }

                // Generate modules based on course category
                var modules = GenerateModulesForCourse(course);
                
                foreach (var module in modules)
                {
                    _context.CourseModules.Add(module);
                    await _context.SaveChangesAsync();
                    
                    // Generate lessons for each module
                    var lessons = GenerateLessonsForModule(module, course.Category);
                    _context.Lessons.AddRange(lessons);
                    await _context.SaveChangesAsync();
                }
            }

            _logger.LogInformation("Course modules and lessons seeded successfully");
        }

        private List<CourseModule> GenerateModulesForCourse(Course course)
        {
            var modules = new List<CourseModule>();
            
            if (course.Title.Contains("Web Development Bootcamp"))
            {
                modules.AddRange(new[]
                {
                    new CourseModule { CourseId = course.Id, Title = "Introduction to Web Development", Description = "Start your web development journey", Order = 1 },
                    new CourseModule { CourseId = course.Id, Title = "HTML5 & CSS3 Fundamentals", Description = "Master the building blocks of the web", Order = 2 },
                    new CourseModule { CourseId = course.Id, Title = "JavaScript Essentials", Description = "Learn modern JavaScript from scratch", Order = 3 },
                    new CourseModule { CourseId = course.Id, Title = "React.js Fundamentals", Description = "Build interactive UIs with React", Order = 4 },
                    new CourseModule { CourseId = course.Id, Title = "Node.js & Express", Description = "Build server-side applications", Order = 5 },
                    new CourseModule { CourseId = course.Id, Title = "MongoDB & Database Design", Description = "Master NoSQL database concepts", Order = 6 },
                    new CourseModule { CourseId = course.Id, Title = "Full Stack Project", Description = "Build a complete web application", Order = 7 }
                });
            }
            else if (course.Title.Contains("React"))
            {
                modules.AddRange(new[]
                {
                    new CourseModule { CourseId = course.Id, Title = "React Hooks Deep Dive", Description = "Master useState, useEffect, and custom hooks", Order = 1 },
                    new CourseModule { CourseId = course.Id, Title = "Advanced State Management", Description = "Redux, Context API, and Zustand", Order = 2 },
                    new CourseModule { CourseId = course.Id, Title = "Performance Optimization", Description = "Make your React apps blazing fast", Order = 3 },
                    new CourseModule { CourseId = course.Id, Title = "Testing React Applications", Description = "Unit tests, integration tests, and E2E", Order = 4 },
                    new CourseModule { CourseId = course.Id, Title = "Production Deployment", Description = "Deploy and monitor React apps", Order = 5 }
                });
            }
            else if (course.Title.Contains("Machine Learning"))
            {
                modules.AddRange(new[]
                {
                    new CourseModule { CourseId = course.Id, Title = "Python for Data Science", Description = "NumPy, Pandas, and data manipulation", Order = 1 },
                    new CourseModule { CourseId = course.Id, Title = "Supervised Learning", Description = "Classification and regression algorithms", Order = 2 },
                    new CourseModule { CourseId = course.Id, Title = "Unsupervised Learning", Description = "Clustering and dimensionality reduction", Order = 3 },
                    new CourseModule { CourseId = course.Id, Title = "Deep Learning with TensorFlow", Description = "Neural networks and deep learning", Order = 4 },
                    new CourseModule { CourseId = course.Id, Title = "Real-World ML Projects", Description = "Apply ML to solve real problems", Order = 5 }
                });
            }
            else if (course.Category == "Mobile Development")
            {
                modules.AddRange(new[]
                {
                    new CourseModule { CourseId = course.Id, Title = "Getting Started", Description = "Set up your development environment", Order = 1 },
                    new CourseModule { CourseId = course.Id, Title = "UI/UX Fundamentals", Description = "Design beautiful mobile interfaces", Order = 2 },
                    new CourseModule { CourseId = course.Id, Title = "Core Features", Description = "Build essential mobile features", Order = 3 },
                    new CourseModule { CourseId = course.Id, Title = "Advanced Topics", Description = "Master platform-specific features", Order = 4 },
                    new CourseModule { CourseId = course.Id, Title = "App Deployment", Description = "Publish to app stores", Order = 5 }
                });
            }
            else if (course.Category == "Design")
            {
                modules.AddRange(new[]
                {
                    new CourseModule { CourseId = course.Id, Title = "Design Principles", Description = "Master the fundamentals of design", Order = 1 },
                    new CourseModule { CourseId = course.Id, Title = "Design Tools", Description = "Learn industry-standard software", Order = 2 },
                    new CourseModule { CourseId = course.Id, Title = "Practical Projects", Description = "Apply your skills to real projects", Order = 3 },
                    new CourseModule { CourseId = course.Id, Title = "Portfolio Development", Description = "Build your design portfolio", Order = 4 }
                });
            }
            else
            {
                // Default modules for other courses
                modules.AddRange(new[]
                {
                    new CourseModule { CourseId = course.Id, Title = "Introduction", Description = "Get started with the basics", Order = 1 },
                    new CourseModule { CourseId = course.Id, Title = "Core Concepts", Description = "Master the fundamental concepts", Order = 2 },
                    new CourseModule { CourseId = course.Id, Title = "Advanced Topics", Description = "Dive deep into advanced features", Order = 3 },
                    new CourseModule { CourseId = course.Id, Title = "Final Project", Description = "Apply everything you've learned", Order = 4 }
                });
            }

            // Set timestamps
            foreach (var module in modules)
            {
                module.CreatedAt = DateTime.UtcNow;
                module.UpdatedAt = DateTime.UtcNow;
            }

            return modules;
        }

        private List<Lesson> GenerateLessonsForModule(CourseModule module, string courseCategory)
        {
            var lessons = new List<Lesson>();
            var lessonCount = module.Order <= 2 ? 5 : 4; // More lessons in early modules

            for (int i = 1; i <= lessonCount; i++)
            {
                var lessonType = i % 3 == 0 ? LessonType.Quiz : (i % 2 == 0 ? LessonType.Assignment : LessonType.Video);
                var duration = lessonType == LessonType.Video ? $"{20 + (i * 5)} minutes" : "30 minutes";

                var lesson = new Lesson
                {
                    ModuleId = module.Id,
                    Title = $"{module.Title} - Lesson {i}",
                    Type = lessonType,
                    Duration = duration,
                    Order = i,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Add content based on lesson type
                switch (lessonType)
                {
                    case LessonType.Video:
                        lesson.VideoUrl = $"https://example.com/videos/course-{module.CourseId}-module-{module.Order}-lesson-{i}";
                        lesson.Content = $"Video content for {lesson.Title}";
                        break;
                    case LessonType.Assignment:
                        lesson.Content = $"Assignment instructions for {lesson.Title}. Complete the following tasks...";
                        break;
                    case LessonType.Quiz:
                        lesson.Content = $"Quiz for {lesson.Title}. Test your knowledge of the concepts covered.";
                        break;
                    case LessonType.Text:
                        lesson.Content = $"Reading material for {lesson.Title}. This lesson covers important concepts...";
                        break;
                }

                lessons.Add(lesson);
            }

            return lessons;
        }
    }
}
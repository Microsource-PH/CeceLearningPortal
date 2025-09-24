// Enhanced DataSeederService updates for consistent data
// Add these methods to DataSeederService.cs

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
    
    // 2. Seed courses with consistent pricing and student distribution
    await SeedCoursesWithConsistentDataAsync();
    
    // 3. Seed enrollments with realistic distribution
    await SeedRealisticEnrollmentsAsync();
    
    // 4. Seed reviews with consistent ratings
    await SeedConsistentReviewsAsync();
    
    // 5. Seed payments for all enrollments
    await SeedCompletePaymentsAsync();
    
    _logger.LogInformation("Consistent data seeding completed");
}

private async Task SeedCoursesWithConsistentDataAsync()
{
    var sarahJohnson = await _userManager.FindByEmailAsync("instructor@example.com");
    var michaelChen = await _userManager.FindByEmailAsync("michael.chen@example.com");
    var emilyDavis = await _userManager.FindByEmailAsync("emily.davis@example.com");
    
    if (sarahJohnson == null) return;
    
    // Clear existing data
    _context.Payments.RemoveRange(_context.Payments);
    _context.Reviews.RemoveRange(_context.Reviews);
    _context.Enrollments.RemoveRange(_context.Enrollments);
    _context.Courses.RemoveRange(_context.Courses);
    await _context.SaveChangesAsync();
    
    var courses = new List<Course>();
    
    // Dr. Sarah Johnson's courses - Top performer with consistent high enrollment
    courses.AddRange(new[]
    {
        new Course
        {
            Title = "Complete Web Development Bootcamp 2025",
            InstructorId = sarahJohnson.Id,
            Price = 89.99m,
            Category = "Web Development",
            Level = CourseLevel.Beginner,
            Status = CourseStatus.Active,
            CreatedAt = DateTime.UtcNow.AddMonths(-6)
        },
        new Course
        {
            Title = "Advanced React & Redux Masterclass",
            InstructorId = sarahJohnson.Id,
            Price = 99.99m,
            Category = "Web Development",
            Level = CourseLevel.Advanced,
            Status = CourseStatus.Active,
            CreatedAt = DateTime.UtcNow.AddMonths(-5)
        },
        new Course
        {
            Title = "Machine Learning with Python & TensorFlow",
            InstructorId = sarahJohnson.Id,
            Price = 119.99m,
            Category = "Data Science",
            Level = CourseLevel.Intermediate,
            Status = CourseStatus.Active,
            CreatedAt = DateTime.UtcNow.AddMonths(-4)
        },
        new Course
        {
            Title = "Full Stack JavaScript Developer Path",
            InstructorId = sarahJohnson.Id,
            Price = 129.99m,
            Category = "Web Development",
            Level = CourseLevel.Intermediate,
            Status = CourseStatus.Active,
            CreatedAt = DateTime.UtcNow.AddMonths(-3)
        },
        new Course
        {
            Title = "Computer Vision Fundamentals",
            InstructorId = sarahJohnson.Id,
            Price = 149.99m,
            Category = "Computer Vision",
            Level = CourseLevel.Advanced,
            Status = CourseStatus.Active,
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
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
                InstructorId = michaelChen.Id,
                Price = 79.99m,
                Category = "Mobile Development",
                Level = CourseLevel.Beginner,
                Status = CourseStatus.Active,
                CreatedAt = DateTime.UtcNow.AddMonths(-5)
            },
            new Course
            {
                Title = "Android Development Masterclass",
                InstructorId = michaelChen.Id,
                Price = 89.99m,
                Category = "Mobile Development",
                Level = CourseLevel.Intermediate,
                Status = CourseStatus.Active,
                CreatedAt = DateTime.UtcNow.AddMonths(-4)
            },
            new Course
            {
                Title = "Flutter & Dart Complete Guide",
                InstructorId = michaelChen.Id,
                Price = 99.99m,
                Category = "Mobile Development",
                Level = CourseLevel.Intermediate,
                Status = CourseStatus.Active,
                CreatedAt = DateTime.UtcNow.AddMonths(-3)
            },
            new Course
            {
                Title = "React Native Development",
                InstructorId = michaelChen.Id,
                Price = 89.99m,
                Category = "Mobile Development",
                Level = CourseLevel.Intermediate,
                Status = CourseStatus.Active,
                CreatedAt = DateTime.UtcNow.AddMonths(-2)
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
                InstructorId = emilyDavis.Id,
                Price = 69.99m,
                Category = "Marketing",
                Level = CourseLevel.Beginner,
                Status = CourseStatus.Active,
                CreatedAt = DateTime.UtcNow.AddMonths(-4)
            },
            new Course
            {
                Title = "SEO & Content Marketing Strategy",
                InstructorId = emilyDavis.Id,
                Price = 79.99m,
                Category = "Marketing",
                Level = CourseLevel.Intermediate,
                Status = CourseStatus.Active,
                CreatedAt = DateTime.UtcNow.AddMonths(-3)
            },
            new Course
            {
                Title = "Social Media Marketing Mastery",
                InstructorId = emilyDavis.Id,
                Price = 89.99m,
                Category = "Marketing",
                Level = CourseLevel.Advanced,
                Status = CourseStatus.Active,
                CreatedAt = DateTime.UtcNow.AddMonths(-2)
            }
        });
    }
    
    _context.Courses.AddRange(courses);
    await _context.SaveChangesAsync();
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
                CompletedAt = progressPercentage == 100 ? DateTime.UtcNow.AddDays(-random.Next(1, 30)) : null,
                Status = progressPercentage == 100 ? EnrollmentStatus.Completed : EnrollmentStatus.Active
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
// Update the SeedDataAsync method in DataSeederService.cs to use the new consistent seeding approach

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
            _logger.LogInformation("Database already contains data. Skipping seed.");
            return;
        }

        _logger.LogInformation("Starting database seeding...");

        // Seed Roles
        await SeedRolesAsync();

        // Seed Users (Admin, Instructors, initial Students)
        await SeedUsersAsync();

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
        _logger.LogInformation($"  Creator Earnings (80%): ${instructor.Revenue * 0.8:F2}");
        _logger.LogInformation($"  Platform Share (20%): ${instructor.Revenue * 0.2:F2}");
        _logger.LogInformation($"  Average Rating: {instructor.AvgRating:F2}");
    }
}
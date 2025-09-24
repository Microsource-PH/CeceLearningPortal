// Add this method to DataSeederService.cs to fix Dr. Sarah Johnson's data
// This ensures proper payment records exist for all enrollments

private async Task FixInstructorPayments()
{
    _logger.LogInformation("Fixing instructor payment data...");
    
    // Get Dr. Sarah Johnson
    var sarah = await _userManager.FindByEmailAsync("instructor@example.com");
    if (sarah == null)
    {
        _logger.LogWarning("Dr. Sarah Johnson not found!");
        return;
    }
    
    // Get her courses
    var sarahCourses = await _context.Courses
        .Include(c => c.Enrollments)
            .ThenInclude(e => e.Student)
        .Where(c => c.InstructorId == sarah.Id)
        .ToListAsync();
    
    _logger.LogInformation($"Found {sarahCourses.Count} courses for Dr. Sarah Johnson");
    
    foreach (var course in sarahCourses)
    {
        _logger.LogInformation($"Processing course: {course.Title} with {course.Enrollments.Count} enrollments");
        
        foreach (var enrollment in course.Enrollments)
        {
            // Check if payment exists
            var existingPayment = await _context.Payments
                .FirstOrDefaultAsync(p => 
                    p.UserId == enrollment.StudentId && 
                    p.CourseId == enrollment.CourseId &&
                    p.Status == PaymentStatus.Completed);
            
            if (existingPayment == null)
            {
                // Create payment record
                var payment = new Payment
                {
                    UserId = enrollment.StudentId,
                    CourseId = enrollment.CourseId,
                    Amount = course.Price,
                    Currency = "USD",
                    Status = PaymentStatus.Completed, // IMPORTANT: Must be Completed
                    PaymentMethod = PaymentMethod.CreditCard,
                    TransactionId = $"fix_{Guid.NewGuid().ToString()[..8]}",
                    CreatedAt = enrollment.EnrolledAt
                };
                
                _context.Payments.Add(payment);
                _logger.LogInformation($"Created payment for student {enrollment.StudentId} in course {course.Title}");
            }
        }
    }
    
    await _context.SaveChangesAsync();
    
    // Verify the fix
    var totalRevenue = await _context.Payments
        .Where(p => p.Course.InstructorId == sarah.Id && p.Status == PaymentStatus.Completed)
        .SumAsync(p => p.Amount);
    
    var totalStudents = await _context.Enrollments
        .CountAsync(e => e.Course.InstructorId == sarah.Id);
    
    var avgRating = await _context.Reviews
        .Where(r => r.Course.InstructorId == sarah.Id)
        .AverageAsync(r => (double?)r.Rating) ?? 0;
    
    _logger.LogInformation($"Dr. Sarah Johnson stats after fix:");
    _logger.LogInformation($"- Total Revenue: ${totalRevenue:F2}");
    _logger.LogInformation($"- Creator Earnings (80%): ${totalRevenue * 0.8:F2}");
    _logger.LogInformation($"- Platform Share (20%): ${totalRevenue * 0.2:F2}");
    _logger.LogInformation($"- Total Students: {totalStudents}");
    _logger.LogInformation($"- Average Rating: {avgRating:F2}");
}

// Call this method in SeedDatabaseAsync after SeedPaymentsAsync:
// await FixInstructorPayments();
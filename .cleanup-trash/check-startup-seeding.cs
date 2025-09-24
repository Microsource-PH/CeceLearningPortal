// Check if DataSeederService is registered and called at startup
// Add this to your Program.cs or Startup.cs if missing:

// In Program.cs, after builder.Services configurations:

// Register the DataSeederService
builder.Services.AddScoped<DataSeederService>();

// After var app = builder.Build():

// Seed the database on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var seeder = services.GetRequiredService<DataSeederService>();
        await seeder.SeedDatabaseAsync();
        Console.WriteLine("Database seeding completed successfully");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database");
    }
}
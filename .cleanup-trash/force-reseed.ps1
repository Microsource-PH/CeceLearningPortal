# PowerShell script to force reseed database
Write-Host "Force Reseeding Database..." -ForegroundColor Green

# Navigate to API directory
Set-Location "D:\ProductDevelopment\Cece\CeceLearningPortal.Backend\CeceLearningPortal.Api"

# Create a temporary Program.cs that forces reseeding
$forceReseedProgram = @'
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.Models;
using CeceLearningPortal.Api.Services;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .WriteTo.Console()
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();
    
    // Add services
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
        
    builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();
        
    builder.Services.AddScoped<DataSeederService>();
    
    var app = builder.Build();
    
    // Force reseed
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var seeder = scope.ServiceProvider.GetRequiredService<DataSeederService>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        
        logger.LogInformation("Clearing old subscription plans...");
        
        // Clear old subscription plans to force new ones
        var oldPlans = await context.SubscriptionPlans.ToListAsync();
        context.SubscriptionPlans.RemoveRange(oldPlans);
        await context.SaveChangesAsync();
        
        logger.LogInformation("Running force reseed...");
        await seeder.SeedDataAsync();
        logger.LogInformation("Force reseed completed!");
    }
    
    Log.Information("Reseed completed successfully!");
}
catch (Exception ex)
{
    Log.Fatal(ex, "Force reseed failed");
}
finally
{
    Log.CloseAndFlush();
}
'@

# Backup current Program.cs
Copy-Item "Program.cs" "Program.cs.backup" -Force

# Write force reseed program
$forceReseedProgram | Out-File -FilePath "Program.cs" -Encoding UTF8

# Run the force reseed
Write-Host "`nRunning force reseed..." -ForegroundColor Yellow
dotnet run --no-build

# Restore original Program.cs
Copy-Item "Program.cs.backup" "Program.cs" -Force
Remove-Item "Program.cs.backup"

Write-Host "`nForce reseed completed!" -ForegroundColor Green
# PowerShell script to check database data
Write-Host "Checking Database Data..." -ForegroundColor Green

# Database connection details
$connectionString = "Host=localhost;Database=CeceLearningPortal;Username=postgres;Password=P@ssword!@"

# Create a test script to check data
$testScript = @"
using Npgsql;
using System;
using System.Threading.Tasks;

class CheckData
{
    static async Task Main(string[] args)
    {
        var connectionString = "$connectionString";
        
        try
        {
            using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();
            
            // Check users
            Console.WriteLine("=== USERS ===");
            using (var cmd = new NpgsqlCommand("SELECT COUNT(*) FROM \"AspNetUsers\"", connection))
            {
                var userCount = await cmd.ExecuteScalarAsync();
                Console.WriteLine($"Total users: {userCount}");
            }
            
            using (var cmd = new NpgsqlCommand("SELECT \"Id\", \"UserName\", \"Email\" FROM \"AspNetUsers\" LIMIT 10", connection))
            using (var reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    Console.WriteLine($"User: {reader.GetString(1)} - {reader.GetString(2)}");
                }
            }
            
            // Check subscription plans
            Console.WriteLine("\n=== SUBSCRIPTION PLANS ===");
            using (var cmd = new NpgsqlCommand("SELECT COUNT(*) FROM \"SubscriptionPlans\"", connection))
            {
                var planCount = await cmd.ExecuteScalarAsync();
                Console.WriteLine($"Total plans: {planCount}");
            }
            
            using (var cmd = new NpgsqlCommand("SELECT \"Id\", \"Name\", \"PlanType\" FROM \"SubscriptionPlans\"", connection))
            using (var reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    Console.WriteLine($"Plan: {reader.GetString(1)} - Type: {reader.GetInt32(2)}");
                }
            }
            
            // Check courses
            Console.WriteLine("\n=== COURSES ===");
            using (var cmd = new NpgsqlCommand("SELECT COUNT(*) FROM \"Courses\"", connection))
            {
                var courseCount = await cmd.ExecuteScalarAsync();
                Console.WriteLine($"Total courses: {courseCount}");
            }
            
            using (var cmd = new NpgsqlCommand("SELECT \"Id\", \"Title\", \"Status\" FROM \"Courses\" LIMIT 10", connection))
            using (var reader = await cmd.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    Console.WriteLine($"Course: {reader.GetString(1)} - Status: {reader.GetInt32(2)}");
                }
            }
            
            // Check subscriptions
            Console.WriteLine("\n=== ACTIVE SUBSCRIPTIONS ===");
            using (var cmd = new NpgsqlCommand("SELECT COUNT(*) FROM \"Subscriptions\" WHERE \"IsActive\" = true", connection))
            {
                var subCount = await cmd.ExecuteScalarAsync();
                Console.WriteLine($"Active subscriptions: {subCount}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
"@

# Save to temp file
$testScript | Out-File -FilePath ".\CheckData.cs" -Encoding UTF8

# Compile and run
Write-Host "`nCompiling..." -ForegroundColor Yellow
dotnet new console -n TempCheck -o .\TempCheck --force | Out-Null
Copy-Item ".\CheckData.cs" ".\TempCheck\Program.cs" -Force
Set-Location ".\TempCheck"
dotnet add package Npgsql | Out-Null
dotnet run

# Cleanup
Set-Location ".."
Remove-Item ".\TempCheck" -Recurse -Force
Remove-Item ".\CheckData.cs"

Write-Host "`nDone!" -ForegroundColor Green
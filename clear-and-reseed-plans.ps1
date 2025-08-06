# PowerShell script to clear and reseed subscription plans
Write-Host "Clearing and Reseeding Subscription Plans..." -ForegroundColor Green

# Create a C# script to clear and reseed
$reseedScript = @'
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.Models;
using CeceLearningPortal.Api.Services;
using Npgsql;
using System;
using System.Threading.Tasks;

class ClearAndReseed
{
    static async Task Main(string[] args)
    {
        var connectionString = "Host=localhost;Database=CeceLearningPortal;Username=postgres;Password=P@ssword!@";
        
        try
        {
            using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();
            
            Console.WriteLine("Clearing subscription plans...");
            
            // Clear subscriptions first (foreign key constraint)
            using (var cmd = new NpgsqlCommand("DELETE FROM \"Subscriptions\"", connection))
            {
                await cmd.ExecuteNonQueryAsync();
            }
            
            // Clear subscription plans
            using (var cmd = new NpgsqlCommand("DELETE FROM \"SubscriptionPlans\"", connection))
            {
                await cmd.ExecuteNonQueryAsync();
            }
            
            Console.WriteLine("Subscription plans cleared!");
            
            // Now trigger the API to reseed
            Console.WriteLine("Please restart the API to reseed the subscription plans.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
'@

# Save to temp file
$reseedScript | Out-File -FilePath ".\ClearAndReseed.cs" -Encoding UTF8

# Compile and run
Write-Host "`nCompiling..." -ForegroundColor Yellow
dotnet new console -n TempReseed -o .\TempReseed --force | Out-Null
Copy-Item ".\ClearAndReseed.cs" ".\TempReseed\Program.cs" -Force
Set-Location ".\TempReseed"
dotnet add package Npgsql | Out-Null
dotnet run

# Cleanup
Set-Location ".."
Remove-Item ".\TempReseed" -Recurse -Force
Remove-Item ".\ClearAndReseed.cs"

Write-Host "`nPlease restart the API to trigger reseeding!" -ForegroundColor Yellow
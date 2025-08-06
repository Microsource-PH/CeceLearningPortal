# Simple PowerShell script to clear subscription plans
Write-Host "Clearing Subscription Plans..." -ForegroundColor Green

# Create a simple SQL script
$clearSql = @'
using Npgsql;
using System;
using System.Threading.Tasks;

class ClearPlans
{
    static async Task Main(string[] args)
    {
        var connectionString = "Host=localhost;Database=CeceLearningPortal;Username=postgres;Password=P@ssword!@";
        
        try
        {
            using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();
            
            Console.WriteLine("Clearing subscription data...");
            
            // Clear in order due to foreign keys
            using (var cmd = new NpgsqlCommand("DELETE FROM \"Payments\"", connection))
            {
                await cmd.ExecuteNonQueryAsync();
                Console.WriteLine("Cleared payments");
            }
            
            using (var cmd = new NpgsqlCommand("DELETE FROM \"Subscriptions\"", connection))
            {
                await cmd.ExecuteNonQueryAsync();
                Console.WriteLine("Cleared subscriptions");
            }
            
            using (var cmd = new NpgsqlCommand("DELETE FROM \"SubscriptionPlans\"", connection))
            {
                await cmd.ExecuteNonQueryAsync();
                Console.WriteLine("Cleared subscription plans");
            }
            
            Console.WriteLine("All subscription data cleared!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
'@

# Save and compile
$clearSql | Out-File -FilePath ".\ClearPlans.cs" -Encoding UTF8
dotnet new console -n ClearPlans -o .\ClearPlans --force | Out-Null
Copy-Item ".\ClearPlans.cs" ".\ClearPlans\Program.cs" -Force
cd .\ClearPlans
dotnet add package Npgsql | Out-Null
dotnet run
cd ..
Remove-Item ".\ClearPlans" -Recurse -Force
Remove-Item ".\ClearPlans.cs"

Write-Host "`nData cleared! Please restart the API to reseed." -ForegroundColor Green
try {
    Stop-Process -Id 34804 -Force -ErrorAction Stop
    Write-Host "Process 34804 killed"
} catch {
    Write-Host "Process 34804 not found or already stopped"
}

# Kill all dotnet processes
Get-Process | Where-Object {$_.ProcessName -eq 'dotnet' -or $_.ProcessName -like 'CeceLearning*'} | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force
        Write-Host "Killed process: $($_.ProcessName) (PID: $($_.Id))"
    } catch {
        Write-Host "Could not kill process: $($_.ProcessName)"
    }
}
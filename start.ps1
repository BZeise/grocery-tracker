# Grocery Tracker startup script
# Runs the backend and frontend in the current terminal, prevents system sleep while running.
#
# If you get a script execution error, run this once in an admin PowerShell:
#   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

Add-Type -Namespace Win32 -Name PowerMgmt -MemberDefinition @'
    [DllImport("kernel32.dll")]
    public static extern uint SetThreadExecutionState(int esFlags);
'@

$ES_CONTINUOUS      = [int]0x80000000   # -2147483648 as signed int32; same bits as 0x80000000
$ES_SYSTEM_REQUIRED = 0x00000001

$scriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir  = Join-Path $scriptDir "backend\GroceryTracker.Api"
$frontendDir = Join-Path $scriptDir "frontend"

Write-Host "Starting Grocery Tracker..." -ForegroundColor Cyan

[Win32.PowerMgmt]::SetThreadExecutionState($ES_CONTINUOUS -bor $ES_SYSTEM_REQUIRED) | Out-Null
Write-Host "Sleep prevention: active" -ForegroundColor Green

$backendJob = Start-Job -ScriptBlock {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    Set-Location $using:backendDir
    dotnet run 2>&1
}

# Brief pause so the backend can bind its port before the frontend starts
Start-Sleep -Seconds 2

$frontendJob = Start-Job -ScriptBlock {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    Set-Location $using:frontendDir
    npm run prod 2>&1
}

Write-Host "Servers are running. Press Ctrl+C to stop." -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Gray
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host ""

try {
    while ($true) {
        foreach ($line in (Receive-Job $backendJob)) {
            Write-Host "[backend]  $line" -ForegroundColor Blue
        }
        foreach ($line in (Receive-Job $frontendJob)) {
            Write-Host "[frontend] $line" -ForegroundColor Magenta
        }
        Start-Sleep -Milliseconds 300
    }
}
finally {
    Write-Host ""
    Write-Host "Shutting down..." -ForegroundColor Cyan

    Stop-Job  $backendJob,  $frontendJob
    Remove-Job $backendJob, $frontendJob

    [Win32.PowerMgmt]::SetThreadExecutionState($ES_CONTINUOUS) | Out-Null
    Write-Host "Sleep prevention: released" -ForegroundColor Green
    Write-Host "Done." -ForegroundColor Cyan
}

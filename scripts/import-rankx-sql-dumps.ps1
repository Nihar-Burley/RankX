param(
    [string]$SourceDir = ".\\sql-dumps\\local"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$resolvedSourceDir = Resolve-Path (Join-Path $repoRoot $SourceDir)
$envFile = Join-Path $repoRoot ".env"
$envExampleFile = Join-Path $repoRoot ".env.docker.example"

function Get-EnvValue {
    param(
        [string]$FilePath,
        [string]$Key
    )

    if (-not (Test-Path $FilePath)) {
        return $null
    }

    $line = Get-Content $FilePath | Where-Object { $_ -match "^${Key}=" } | Select-Object -First 1
    if (-not $line) {
        return $null
    }

    return ($line -split "=", 2)[1].Trim()
}

$mysqlRootPassword = Get-EnvValue -FilePath $envFile -Key "MYSQL_ROOT_PASSWORD"
if (-not $mysqlRootPassword) {
    $mysqlRootPassword = Get-EnvValue -FilePath $envExampleFile -Key "MYSQL_ROOT_PASSWORD"
}

if (-not $mysqlRootPassword) {
    throw "MYSQL_ROOT_PASSWORD was not found in .env or .env.docker.example"
}

$sqlFiles = Get-ChildItem -Path $resolvedSourceDir -Filter *.sql | Sort-Object Name
if ($sqlFiles.Count -eq 0) {
    throw "No SQL files found in $resolvedSourceDir"
}

Push-Location $repoRoot
try {
    $mysqlContainer = (docker compose ps -q mysql).Trim()
    if (-not $mysqlContainer) {
        throw "MySQL container is not running. Start the stack with 'docker compose up -d' first."
    }

    foreach ($file in $sqlFiles) {
        Write-Host "Importing $($file.Name) from $resolvedSourceDir"
        $tmpTarget = "/tmp/$($file.Name)"
        $mysqlCommand = "MYSQL_PWD=""$mysqlRootPassword"" mysql -uroot < $tmpTarget"

        docker cp $file.FullName "${mysqlContainer}:${tmpTarget}" | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to copy $($file.Name) into the MySQL container."
        }

        docker compose exec -T mysql sh -lc $mysqlCommand
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to import $($file.Name)."
        }

        docker compose exec -T mysql rm -f $tmpTarget | Out-Null
    }

    Write-Host "SQL import completed successfully."
}
finally {
    Pop-Location
}

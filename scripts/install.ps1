Write-Host "==> Home Server Infrastructure setup"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker is not installed."
    Write-Host "Install Docker Desktop first."
    exit 1
}

Write-Host "Docker detected."

docker version

Write-Host "==> Environment is ready"
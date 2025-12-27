# Set Heroku Environment Variables from .env file
$ErrorActionPreference = "Continue"
$envFile = "e:\4th semester tasks\Full-Stack-Labs\Project\mern-ecommerce\server\.env"
$appName = "nexusmart-ecommerce"

# Read and parse .env file
$envContent = Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        @{
            Key = $matches[1].Trim()
            Value = $matches[2].Trim()
        }
    }
}

# Set MONGODB_URI
$mongoUri = ($envContent | Where-Object { $_.Key -eq 'MONGODB_URI' }).Value
if ($mongoUri) {
    Write-Host "Setting MONGODB_URI..." -ForegroundColor Cyan
    & heroku config:set "MONGODB_URI=$mongoUri" -a $appName
}

# Set Cloudinary if configured
$cloudName = ($envContent | Where-Object { $_.Key -eq 'CLOUDINARY_CLOUD_NAME' }).Value
$cloudKey = ($envContent | Where-Object { $_.Key -eq 'CLOUDINARY_API_KEY' }).Value
$cloudSecret = ($envContent | Where-Object { $_.Key -eq 'CLOUDINARY_API_SECRET' }).Value

if ($cloudName -and $cloudName -notlike '*your_*') {
    Write-Host "Setting Cloudinary configs..." -ForegroundColor Cyan
    & heroku config:set "CLOUDINARY_CLOUD_NAME=$cloudName" -a $appName
    & heroku config:set "CLOUDINARY_API_KEY=$cloudKey" -a $appName
    & heroku config:set "CLOUDINARY_API_SECRET=$cloudSecret" -a $appName
}

# Set Stripe if configured
$stripeSecret = ($envContent | Where-Object { $_.Key -eq 'STRIPE_SECRET_KEY' }).Value
$stripePublic = ($envContent | Where-Object { $_.Key -eq 'STRIPE_PUBLISHABLE_KEY' }).Value

if ($stripeSecret -and $stripeSecret -notlike '*your_*' -and $stripeSecret -notlike '*sk_test*') {
    Write-Host "Setting Stripe configs..." -ForegroundColor Cyan
    & heroku config:set "STRIPE_SECRET_KEY=$stripeSecret" -a $appName
    & heroku config:set "STRIPE_PUBLISHABLE_KEY=$stripePublic" -a $appName
}

Write-Host "Environment variables configured successfully!" -ForegroundColor Green

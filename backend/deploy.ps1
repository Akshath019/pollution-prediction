# Urban Pollution Prediction API - Google Cloud Run Deployment Script (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "🚀 Deploying to Google Cloud Run" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Configuration
$PROJECT_ID = "your-project-id"  # CHANGE THIS!
$SERVICE_NAME = "pollution-prediction-api"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  Project ID: $PROJECT_ID"
Write-Host "  Service: $SERVICE_NAME"
Write-Host "  Region: $REGION"
Write-Host "  Image: $IMAGE_NAME"
Write-Host ""

# Step 1: Build Docker image
Write-Host "🐳 Step 1: Building Docker image..." -ForegroundColor Green
docker build -t $IMAGE_NAME .

# Step 2: Push to Google Container Registry
Write-Host "📤 Step 2: Pushing to Google Container Registry..." -ForegroundColor Green
docker push $IMAGE_NAME

# Step 3: Deploy to Cloud Run
Write-Host "☁️  Step 3: Deploying to Cloud Run..." -ForegroundColor Green
gcloud run deploy $SERVICE_NAME `
  --image $IMAGE_NAME `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --memory 1Gi `
  --cpu 1 `
  --timeout 300 `
  --max-instances 10 `
  --set-env-vars "PORT=8080"

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Get service URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'

Write-Host "🌐 Your API is now live at:" -ForegroundColor Green
Write-Host "  $SERVICE_URL" -ForegroundColor White
Write-Host ""
Write-Host "📡 Test it:" -ForegroundColor Yellow
Write-Host "  Invoke-WebRequest -Uri $SERVICE_URL/health | Select-Object -ExpandProperty Content" -ForegroundColor White
Write-Host ""
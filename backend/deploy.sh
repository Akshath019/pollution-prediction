#!/bin/bash

# Urban Pollution Prediction API - Google Cloud Run Deployment Script

set -e  # Exit on error

echo "=================================="
echo "🚀 Deploying to Google Cloud Run"
echo "=================================="

# Configuration
PROJECT_ID="your-project-id"  # CHANGE THIS!
SERVICE_NAME="pollution-prediction-api"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo ""
echo "📋 Configuration:"
echo "  Project ID: ${PROJECT_ID}"
echo "  Service: ${SERVICE_NAME}"
echo "  Region: ${REGION}"
echo "  Image: ${IMAGE_NAME}"
echo ""

# Step 1: Build Docker image
echo "🐳 Step 1: Building Docker image..."
docker build -t ${IMAGE_NAME} .

# Step 2: Push to Google Container Registry
echo "📤 Step 2: Pushing to Google Container Registry..."
docker push ${IMAGE_NAME}

# Step 3: Deploy to Cloud Run
echo "☁️  Step 3: Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars "PORT=8080"

echo ""
echo "=================================="
echo "✅ Deployment Complete!"
echo "=================================="
echo ""
echo "🌐 Your API is now live at:"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)'
echo ""
echo "📡 Test it:"
echo "  curl \$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')/health"
echo ""
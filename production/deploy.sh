#!/bin/bash

set -e

echo "Starting production deployment..."

# Get Pi IP for configuration
PI_IP=$(hostname -I | awk '{print $1}')
echo "Pi IP: $PI_IP"

# Pull latest code
git pull origin main

# Build production images
docker-compose -f docker-compose.prod.yml build --no-cache

# Stop development containers
docker-compose down

# Start production containers
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 30

# Health checks
curl -k https://localhost/health || echo "Health check failed"

echo "Production deployment complete!"
echo "Access your application at: https://$PI_IP"

# Show service status
docker-compose -f docker-compose.prod.yml ps
# Docker Guide for HealthInsight Today Frontend

This guide explains how to use Docker with the HealthInsight Today frontend application.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Available Docker Configurations

This repository includes two main Docker configurations:

1. **Development Environment** - Uses `Dockerfile.dev` for a development setup with hot reloading
2. **Production Environment** - Uses `Dockerfile` for an optimized production build served by Nginx

## Development Environment

The development environment provides hot reloading, so your changes will be reflected immediately.

### Start Development Environment

```bash
# Start the development container
docker-compose up frontend-dev

# Or in detached mode
docker-compose up -d frontend-dev
```

This will:
- Build the container using `Dockerfile.dev`
- Mount your local code into the container
- Start the development server on port 3000
- Enable hot reloading

### Access the Development App

The application will be available at: http://localhost:3000

## Production Environment

The production environment uses Nginx to serve the optimized build of the application.

### Start Production Environment

```bash
# Start the production container
docker-compose up frontend-prod

# Or in detached mode
docker-compose up -d frontend-prod
```

This will:
- Build the application using `Dockerfile`
- Create an optimized production build
- Serve it using Nginx on port 80

### Access the Production App

The application will be available at: http://localhost

## Environment Variables

You can customize the behavior of the application by passing environment variables:

```bash
# Example with custom API URL
REACT_APP_API_URL=http://api.example.com/api docker-compose up frontend-prod
```

Available environment variables:

- `REACT_APP_API_URL`: URL of the backend API (default: http://localhost:5000/api)

## Building Custom Images

You can build and tag custom images for deployment:

```bash
# Build development image
docker build -t healthinsight-frontend:dev -f Dockerfile.dev .

# Build production image
docker build -t healthinsight-frontend:latest .
```

## Troubleshooting

### Container won't start

Check for port conflicts:
```bash
docker-compose logs frontend-dev
# or
docker-compose logs frontend-prod
```

### No hot reloading in development

Ensure your Docker configuration supports file watching:

For WSL2 or certain Linux environments, update your docker-compose.yml:
```yaml
environment:
  - CHOKIDAR_USEPOLLING=true
```

## Cleaning Up

To stop and remove containers:
```bash
# Stop containers
docker-compose down

# Remove volumes too
docker-compose down -v
``` 
# CECE Learning Portal

## Comprehensive eLearning & Content Ecosystem

A modern learning management system built with React, TypeScript, and .NET Core.

## Project Structure

- **Frontend**: React + Vite + TypeScript
- **Backend**: .NET Core API with PostgreSQL
- **Authentication**: JWT-based authentication
- **Real-time**: SignalR for notifications

## Getting Started

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- .NET 6.0 SDK or later
- PostgreSQL

### Frontend Setup

```sh
# Navigate to frontend directory
cd cece-learningportal-main

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Serve production build
npm run start:prod
```

### Backend Setup

```sh
# Navigate to backend directory
cd CeceLearningPortal.Backend/CeceLearningPortal.Api

# Restore packages
dotnet restore

# Run migrations
dotnet ef database update

# Start the API
dotnet run
```

## Technologies Used

### Frontend
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Router
- React Query

### Backend
- .NET Core
- Entity Framework Core
- PostgreSQL
- SignalR
- JWT Authentication

## Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Azure Static Web Apps

### Backend Deployment
The backend can be deployed to:
- IIS (Windows)
- Azure App Service
- AWS Elastic Beanstalk
- Docker containers

## Environment Configuration

### Frontend (.env)
```
VITE_API_URL=https://your-api-url.com/api
VITE_SIGNALR_URL=https://your-api-url.com/hubs/notifications
```

### Backend (appsettings.json)
Configure your database connection, JWT settings, and CORS origins in the appropriate appsettings file.

## Features

- User authentication and authorization
- Course management
- Student enrollment
- Progress tracking
- Real-time notifications
- Admin dashboard
- Revenue analytics
- Subscription management

## Support

For issues and feature requests, please use the GitHub issues section.
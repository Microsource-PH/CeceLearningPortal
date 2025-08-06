# Cece Learning Portal Backend

This is the backend API for the Cece Learning Portal, built with ASP.NET Core 9.0 and PostgreSQL.

## Prerequisites

- .NET 9.0 SDK
- PostgreSQL
- Visual Studio 2022 or VS Code (optional)

## Getting Started

1. **Clone the repository**
   ```bash
   cd CeceLearningPortal.Backend
   ```

2. **Configure the database connection**
   
   Update the connection string in `CeceLearningPortal.Api/appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Database=CeceLearningPortal;Username=postgres;Password=yourpassword"
   }
   ```

3. **Apply database migrations**
   ```bash
   cd CeceLearningPortal.Api
   dotnet ef database update
   ```

4. **Run the application**
   ```bash
   dotnet run
   ```

   The API will be available at:
   - https://localhost:5001
   - http://localhost:5000

5. **Access Swagger documentation**
   
   Navigate to https://localhost:5001/swagger to view and test the API endpoints.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - OAuth support (Google, Facebook)
  - Role-based access control (Student, Instructor, Admin)
  - Refresh token rotation
  - Password history tracking

- **Course Management**
  - Create, update, and delete courses
  - Course modules and lessons
  - Course enrollment system
  - Progress tracking
  - Certificate generation

- **User Management**
  - User registration and profile management
  - Instructor approval workflow
  - User statistics and analytics

- **Payment System**
  - Course purchases
  - Subscription management
  - Payment history and refunds

- **Real-time Features**
  - SignalR hub for notifications
  - Real-time updates for course changes

- **Other Features**
  - Comprehensive logging with Serilog
  - API documentation with Swagger
  - CORS configured for frontend integration

## API Structure

- `/api/auth` - Authentication endpoints
- `/api/courses` - Course management
- `/api/users` - User management
- `/api/enrollments` - Course enrollments
- `/api/payments` - Payment processing
- `/api/notifications` - Notification management
- `/hubs/notifications` - SignalR notification hub

## Configuration

### JWT Settings
Update in `appsettings.json`:
```json
"JwtSettings": {
  "Secret": "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong",
  "Issuer": "CeceLearningPortal",
  "Audience": "CeceLearningPortalUsers",
  "ExpirationInMinutes": 60,
  "RefreshTokenExpirationInDays": 7
}
```

### OAuth Providers
Configure Google and Facebook authentication:
```json
"Authentication": {
  "Google": {
    "ClientId": "your-google-client-id",
    "ClientSecret": "your-google-client-secret"
  },
  "Facebook": {
    "AppId": "your-facebook-app-id",
    "AppSecret": "your-facebook-app-secret"
  }
}
```

## Development

### Adding new migrations
```bash
dotnet ef migrations add MigrationName
```

### Updating the database
```bash
dotnet ef database update
```

### Running in development mode
```bash
dotnet run --environment Development
```

## Testing

The project includes a test setup in the `/Tests` directory. Run tests with:
```bash
dotnet test
```

## Frontend Integration

The backend is configured to work with the React frontend running on:
- http://localhost:5173
- http://localhost:3000

CORS is pre-configured for these origins.

## Security Notes

- Always use HTTPS in production
- Update the JWT secret key in production
- Use environment variables for sensitive configuration
- Enable rate limiting in production
- Implement API versioning for production deployments
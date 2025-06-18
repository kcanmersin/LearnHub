# LearnHub Backend API

A comprehensive ASP.NET Core Web API for the LearnHub translation and vocabulary management system, built with Clean Architecture, CQRS pattern, and PostgreSQL.

## 🏗️ Architecture

- **Clean Architecture**: Organized into Domain, Application, Infrastructure, and API layers
- **CQRS Pattern**: Implemented using MediatR for command and query separation
- **Unit of Work**: Transactional data access pattern
- **JWT Authentication**: Secure user authentication and authorization
- **Entity Framework Core**: PostgreSQL database integration
- **Swagger/OpenAPI**: Comprehensive API documentation

## 🚀 Features

### Authentication & Authorization
- User registration and login
- JWT token-based authentication
- Secure password hashing with BCrypt

### Translation Service
- Integration with Groq API (llama-3.3-70b-versatile model)
- Real-time text translation to Turkish
- Error handling and retry mechanisms

### Vocabulary Management
- Personal vocabulary entries
- Domain-based categorization
- Search and filter capabilities
- CRUD operations for vocabulary entries

## 📁 Project Structure

```
LearnHub.Backend/
├── src/
│   ├── LearnHub.API/              # Web API layer
│   │   ├── Controllers/           # API controllers
│   │   ├── Services/             # API-specific services
│   │   └── Program.cs            # Application entry point
│   ├── LearnHub.Application/      # Application layer
│   │   ├── Commands/             # CQRS commands
│   │   ├── Queries/              # CQRS queries
│   │   ├── DTOs/                 # Data transfer objects
│   │   └── Services/             # Application services
│   ├── LearnHub.Domain/           # Domain layer
│   │   ├── Entities/             # Domain entities
│   │   └── Interfaces/           # Domain interfaces
│   └── LearnHub.Infrastructure/   # Infrastructure layer
│       ├── Data/                 # DbContext and configurations
│       └── Repositories/         # Repository implementations
└── tests/
    └── LearnHub.Tests/           # Unit and integration tests
```

## 🛠️ Prerequisites

- .NET 8.0 SDK or later
- PostgreSQL database
- Groq API key

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
CONNECTION_STRING=your_postgresql_connection_string
DATABASE_NAME=LearnHubDb

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRY_MINUTES=60
JWT_ISSUER=LearnHub
JWT_AUDIENCE=LearnHubUsers

# Groq API Configuration
GROQ_API_KEY=your_groq_api_key
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.3-70b-versatile

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:4200,chrome-extension://,https://localhost:5001
```

## 🚀 Getting Started

### 1. Clone and Setup

```bash
git clone <repository-url>
cd LearnHub.Backend
```

### 2. Restore Dependencies

```bash
dotnet restore
```

### 3. Database Setup

The application will automatically create the database and seed initial data on first run.

### 4. Run the Application

```bash
cd src/LearnHub.API
dotnet run
```

The API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `https://localhost:5001` (root path)

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login

### Translation
- `POST /api/translation` - Translate text using Groq API

### Vocabulary Management
- `GET /api/vocabulary` - Get user's vocabulary entries
- `POST /api/vocabulary` - Add new vocabulary entry
- `DELETE /api/vocabulary/{id}` - Delete vocabulary entry

## 🔐 Authentication

All endpoints except registration and login require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Swagger Documentation

The API includes comprehensive Swagger documentation with:
- Detailed endpoint descriptions
- Request/response schemas
- Default example values
- Authentication integration
- Try-it-out functionality

Access Swagger UI at the application root URL when running in development mode.

## 🧪 Seed Data

The application includes seed data for testing:

**Test User:**
- Username: `testuser`
- Email: `test@learnhub.com`
- Password: `password123`

**Sample Vocabulary Entries:**
- "Hello world" → "Merhaba dünya" (from example.com)
- "Good morning" → "Günaydın" (from wikipedia.org)
- "Thank you" → "Teşekkür ederim" (from twitter.com)

## 🛡️ Security Features

- Password hashing using BCrypt
- JWT token validation
- CORS configuration
- SQL injection protection via Entity Framework
- Request validation and sanitization

## 🐛 Error Handling

The API includes comprehensive error handling with:
- Structured error responses
- Detailed error messages in development
- Generic error messages in production
- HTTP status code mapping

## 📈 Performance Considerations

- Async/await patterns throughout
- Database query optimization
- Connection pooling
- Response caching where appropriate

## 🔧 Development Notes

- Uses Entity Framework Code First approach
- Implements repository pattern with Unit of Work
- Follows SOLID principles
- Includes comprehensive logging
- Supports both HTTP and HTTPS

## 🚀 Deployment

The application is ready for deployment to various platforms:
- Azure App Service
- Docker containers
- IIS
- Linux servers

Ensure all environment variables are properly configured in your deployment environment.
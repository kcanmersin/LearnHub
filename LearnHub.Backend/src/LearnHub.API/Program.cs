using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MediatR;
using DotNetEnv;
using LearnHub.Infrastructure.Data;
using LearnHub.Infrastructure.Repositories;
using LearnHub.Domain.Interfaces;
using LearnHub.Application.Services;
using LearnHub.API.Services;
using Swashbuckle.AspNetCore.SwaggerGen;

try
{
Console.WriteLine("Starting LearnHub API...");

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
var envPaths = new[]
{
    Path.Combine(Directory.GetCurrentDirectory(), ".env"), // Current directory
    Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", ".env"), // Solution root
    Path.Combine(AppContext.BaseDirectory, ".env") // Base directory
};

foreach (var envPath in envPaths)
{
    if (File.Exists(envPath))
    {
        Env.Load(envPath);
        break;
    }
}

// Add environment variables to configuration
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
builder.Services.AddControllers();

// Add DbContext
var connectionString = builder.Configuration["CONNECTION_STRING"] ?? 
    Environment.GetEnvironmentVariable("CONNECTION_STRING");

if (!string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine("Using PostgreSQL database");
    builder.Services.AddDbContext<LearnHubDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else
{
    Console.WriteLine("Using SQLite database for development");
    builder.Services.AddDbContext<LearnHubDbContext>(options =>
        options.UseSqlite("Data Source=learnhub.db"));
}

// Add repositories
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Add MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(LearnHub.Application.Commands.Auth.RegisterCommand).Assembly));

// Add services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddHttpClient<ITranslationService, GroqTranslationService>();

// Add JWT Authentication
var jwtSecret = builder.Configuration["JWT_SECRET"] ?? 
    Environment.GetEnvironmentVariable("JWT_SECRET") ??
    "your-super-secret-jwt-key-here-make-it-long-and-complex";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["JWT_ISSUER"] ?? "LearnHub",
            ValidateAudience = true,
            ValidAudience = builder.Configuration["JWT_AUDIENCE"] ?? "LearnHubUsers",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// Add CORS
var allowedOrigins = builder.Configuration["ALLOWED_ORIGINS"]?.Split(',') ?? 
    Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")?.Split(',') ??
    new[] { "http://localhost:4200", "chrome-extension://", "https://localhost:5001" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "LearnHub API",
        Version = "v1",
        Description = "API for LearnHub translation and vocabulary management system"
    });

    // Configure JWT authentication for Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Include XML comments
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // Add default values for Swagger
    c.SchemaFilter<DefaultValueSchemaFilter>();
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "LearnHub API V1");
        c.RoutePrefix = string.Empty; // Set Swagger UI at the app's root
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowSpecificOrigins");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<LearnHubDbContext>();
    try
    {
        Console.WriteLine("Initializing database...");
        context.Database.EnsureCreated();
        Console.WriteLine("Database initialized successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database initialization failed: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        if (ex.InnerException != null)
        {
            Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
        }
    }
}

Console.WriteLine("Application starting on https://localhost:5001");
app.Run();

}
catch (Exception ex)
{
    Console.WriteLine($"Application startup failed: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
    if (ex.InnerException != null)
    {
        Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
    }
    Environment.Exit(1);
}

// Swagger default values schema filter
public class DefaultValueSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type == typeof(LearnHub.Application.DTOs.CreateUserDto))
        {
            schema.Properties["username"].Default = new Microsoft.OpenApi.Any.OpenApiString("testuser");
            schema.Properties["email"].Default = new Microsoft.OpenApi.Any.OpenApiString("test@example.com");
            schema.Properties["password"].Default = new Microsoft.OpenApi.Any.OpenApiString("password123");
        }
        else if (context.Type == typeof(LearnHub.Application.DTOs.LoginDto))
        {
            schema.Properties["username"].Default = new Microsoft.OpenApi.Any.OpenApiString("testuser");
            schema.Properties["password"].Default = new Microsoft.OpenApi.Any.OpenApiString("password123");
        }
        else if (context.Type == typeof(LearnHub.Application.DTOs.TranslationRequestDto))
        {
            schema.Properties["textToTranslate"].Default = new Microsoft.OpenApi.Any.OpenApiString("Hello world");
        }
        else if (context.Type == typeof(LearnHub.Application.DTOs.CreateVocabularyEntryDto))
        {
            schema.Properties["originalText"].Default = new Microsoft.OpenApi.Any.OpenApiString("Hello world");
            schema.Properties["translatedText"].Default = new Microsoft.OpenApi.Any.OpenApiString("Merhaba dünya");
            schema.Properties["sourceDomain"].Default = new Microsoft.OpenApi.Any.OpenApiString("example.com");
        }
    }
}
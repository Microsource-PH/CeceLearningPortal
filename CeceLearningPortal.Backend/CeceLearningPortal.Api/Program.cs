using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;
using CeceLearningPortal.Api.Configurations;
using CeceLearningPortal.Api.Data;
using CeceLearningPortal.Api.Hubs;
using CeceLearningPortal.Api.Middleware;
using CeceLearningPortal.Api.Models;
using CeceLearningPortal.Api.Services;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Add Serilog
    builder.Host.UseSerilog();

    // Add services to the container.
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        });
    
    // Configure Database
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

    // Configure Identity
    builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequiredLength = 6;
        options.Password.RequireDigit = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

    // Configure JWT
    var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
    if (jwtSettings == null)
    {
        throw new InvalidOperationException("JwtSettings configuration is missing");
    }
    builder.Services.AddSingleton(jwtSettings);

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
            ClockSkew = TimeSpan.Zero
        };

        // Support SignalR authentication
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    })
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    })
    .AddFacebook(options =>
    {
        options.AppId = builder.Configuration["Authentication:Facebook:AppId"];
        options.AppSecret = builder.Configuration["Authentication:Facebook:AppSecret"];
    });

    // Configure CORS
    var corsOrigins = builder.Configuration.GetSection("CorsOrigins").Get<string[]>() ?? new[] { "http://localhost:5173" };
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowSpecificOrigins", policy =>
        {
            policy.WithOrigins(corsOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
    });

    // Configure Swagger
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Cece Learning Portal API",
            Version = "v1",
            Description = "API for Cece Learning Portal"
        });

        // Configure JWT authentication for Swagger
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
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
    });

    // Add SignalR
    builder.Services.AddSignalR();

    // Register Services
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<ICourseService, CourseService>();
    builder.Services.AddScoped<IUserService, UserService>();
    builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
    builder.Services.AddScoped<INotificationService, NotificationService>();
    builder.Services.AddScoped<IPaymentService, PaymentService>();
    builder.Services.AddScoped<IRevenueCalculationService, RevenueCalculationService>();
    builder.Services.AddScoped<ILearningService, LearningService>();
    builder.Services.AddScoped<IAdminService, AdminService>();
    builder.Services.AddScoped<ISubscriptionManagementService, SubscriptionManagementService>();
    builder.Services.AddScoped<ISubscriptionPlanService, SubscriptionPlanService>();
    builder.Services.AddScoped<DataSeederService>();

    // Add Authorization Policies
    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
        options.AddPolicy("InstructorOnly", policy => policy.RequireRole("Instructor", "Admin"));
        options.AddPolicy("StudentOnly", policy => policy.RequireRole("Student"));
        options.AddPolicy("ActiveUserOnly", policy => policy.RequireClaim("status", UserStatus.Active.ToString()));
    });

    var app = builder.Build();

    // Configure the HTTP request pipeline.
    //if (app.Environment.IsDevelopment())
    //{
    //    app.UseSwagger();
    //    app.UseSwaggerUI(c =>
    //    {
    //        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Cece Learning Portal API V1");
    //    });
    //}

    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Cece Learning Portal API V1");
    });

    app.UseHttpsRedirection();
    app.UseStaticFiles();
    app.UseCors("AllowSpecificOrigins");
    
    app.UseAuthentication();
    app.UseTokenBlacklist();
    app.UseAuthorization();

    app.MapControllers();
    app.MapHub<NotificationHub>("/hubs/notifications");

    // Apply migrations and seed data on startup
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            
            logger.LogInformation("Checking database connection...");
            if (await context.Database.CanConnectAsync())
            {
                logger.LogInformation("Database connection successful.");
                
                try
                {
                    // Try to apply migrations
                    logger.LogInformation("Attempting to apply migrations...");
                    await context.Database.MigrateAsync();
                    logger.LogInformation("Migrations applied successfully.");
                }
                catch (Exception migrationEx)
                {
                    logger.LogWarning(migrationEx, "Migration failed. This might be due to pending model changes. Continuing anyway...");
                }
                
                // Seed data regardless of migration status
                logger.LogInformation("Starting data seeding...");
                var seeder = scope.ServiceProvider.GetRequiredService<DataSeederService>();
                await seeder.SeedDataAsync();
                logger.LogInformation("Data seeding completed.");
            }
            else
            {
                logger.LogError("Cannot connect to database. Please check your connection string.");
            }
        }
        catch (Exception ex)
        {
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "Error during database initialization");
            // Don't throw - let the app start anyway
        }
    }

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application start-up failed");
}
finally
{
    Log.CloseAndFlush();
}
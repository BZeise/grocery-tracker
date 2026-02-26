using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using GroceryTracker.Api.Data;
using GroceryTracker.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Entity Framework with SQLite
builder.Services.AddDbContext<GroceryTrackerContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure CORS for local network access
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// Ensure database is created and schema is up to date
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<GroceryTrackerContext>();
    context.Database.EnsureCreated();

    // Create Users table if it doesn't exist (safe to run repeatedly)
    context.Database.ExecuteSqlRaw(@"
        CREATE TABLE IF NOT EXISTS Users (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT NOT NULL,
            CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
        )");

    // Seed users if the table is empty
    if (!context.Users.Any())
    {
        context.Users.AddRange(
            new User { Name = "Ham" },    // Id=1
            new User { Name = "Ben" },    // Id=2
            new User { Name = "Calvin" }, // Id=3
            new User { Name = "Dori" }    // Id=4
        );
        context.SaveChanges();
    }

    // Add UserId column to PriceEntries if it doesn't already exist.
    // SQLite doesn't support NOT NULL DEFAULT in ALTER TABLE, so we add it as nullable
    // and then update existing rows to Ben (Id=2) separately.
    var columns = context.Database
        .SqlQueryRaw<string>("SELECT name FROM pragma_table_info('PriceEntries')")
        .ToList();

    if (!columns.Contains("UserId"))
    {
        context.Database.ExecuteSqlRaw(
            "ALTER TABLE PriceEntries ADD COLUMN UserId INTEGER NULL");
        context.Database.ExecuteSqlRaw(
            "UPDATE PriceEntries SET UserId = 2");
    }
}

app.Run();

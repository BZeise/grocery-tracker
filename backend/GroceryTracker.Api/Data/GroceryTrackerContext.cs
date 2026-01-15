using Microsoft.EntityFrameworkCore;
using GroceryTracker.Api.Models;
using System.Text.Json;

namespace GroceryTracker.Api.Data;

public class GroceryTrackerContext : DbContext
{
    public GroceryTrackerContext(DbContextOptions<GroceryTrackerContext> options) : base(options)
    {
    }

    public DbSet<Item> Items => Set<Item>();
    public DbSet<Store> Stores => Set<Store>();
    public DbSet<PriceEntry> PriceEntries => Set<PriceEntry>();
    public DbSet<ChangeLog> ChangeLogs => Set<ChangeLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<Store>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
        });

        modelBuilder.Entity<PriceEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasPrecision(18, 4);
            entity.Property(e => e.UnitType).HasMaxLength(20).IsRequired();
            entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
            entity.Property(e => e.PricePerUnit).HasPrecision(18, 4);
            entity.Property(e => e.RecordedAt).HasDefaultValueSql("datetime('now')");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");

            entity.HasOne(e => e.Item)
                .WithMany(i => i.PriceEntries)
                .HasForeignKey(e => e.ItemId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Store)
                .WithMany(s => s.PriceEntries)
                .HasForeignKey(e => e.StoreId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChangeLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TableName).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Action).HasMaxLength(20).IsRequired();
            entity.Property(e => e.ChangedAt).HasDefaultValueSql("datetime('now')");
        });
    }

    public async Task LogChangeAsync<T>(string action, int recordId, T? oldEntity, T? newEntity)
    {
        var log = new ChangeLog
        {
            TableName = typeof(T).Name,
            RecordId = recordId,
            Action = action,
            OldValues = oldEntity != null ? JsonSerializer.Serialize(oldEntity) : null,
            NewValues = newEntity != null ? JsonSerializer.Serialize(newEntity) : null,
            ChangedAt = DateTime.UtcNow
        };

        ChangeLogs.Add(log);
        await SaveChangesAsync();
    }
}

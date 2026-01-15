namespace GroceryTracker.Api.Models;

public class PriceEntry
{
    public int Id { get; set; }
    public int ItemId { get; set; }
    public int StoreId { get; set; }
    public decimal Quantity { get; set; }
    public string UnitType { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public decimal PricePerUnit { get; set; }
    public bool IsOverridden { get; set; }
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Item Item { get; set; } = null!;
    public Store Store { get; set; } = null!;
}

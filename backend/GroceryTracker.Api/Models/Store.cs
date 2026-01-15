namespace GroceryTracker.Api.Models;

public class Store
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PriceEntry> PriceEntries { get; set; } = new List<PriceEntry>();
}

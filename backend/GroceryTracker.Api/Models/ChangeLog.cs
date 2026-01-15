namespace GroceryTracker.Api.Models;

public class ChangeLog
{
    public int Id { get; set; }
    public string TableName { get; set; } = string.Empty;
    public int RecordId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}

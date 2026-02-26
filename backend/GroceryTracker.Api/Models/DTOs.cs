namespace GroceryTracker.Api.Models;

// Request DTOs
public record CreateItemRequest(string Name);
public record UpdateItemRequest(string Name);
public record CreateStoreRequest(string Name);

public record CreatePriceEntryRequest(
    int ItemId,
    int StoreId,
    int UserId,
    decimal Quantity,
    string UnitType,
    decimal TotalPrice,
    decimal? PricePerUnit,
    DateTime? RecordedAt
);

public record UpdatePriceEntryRequest(
    int UserId,
    decimal Quantity,
    string UnitType,
    decimal TotalPrice,
    decimal? PricePerUnit,
    DateTime? RecordedAt
);

// Response DTOs
public record UserDto(int Id, string Name);

public record ItemDto(
    int Id,
    string Name,
    DateTime CreatedAt,
    bool IsActive,
    List<PriceEntryDto> PriceEntries
);

public record ItemSummaryDto(
    int Id,
    string Name,
    DateTime CreatedAt,
    PriceEntryDto? BestPrice,
    List<StorePriceDto> LatestPricesByStore
);

public record StorePriceDto(
    int StoreId,
    string StoreName,
    decimal PricePerUnit,
    decimal TotalPrice,
    decimal Quantity,
    string UnitType,
    DateTime RecordedAt
);

public record PriceEntryDto(
    int Id,
    int ItemId,
    int StoreId,
    string StoreName,
    int UserId,
    string UserName,
    decimal Quantity,
    string UnitType,
    decimal TotalPrice,
    decimal PricePerUnit,
    bool IsOverridden,
    DateTime RecordedAt,
    DateTime CreatedAt
);

public record StoreDto(
    int Id,
    string Name,
    DateTime CreatedAt
);

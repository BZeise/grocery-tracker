using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GroceryTracker.Api.Data;
using GroceryTracker.Api.Models;

namespace GroceryTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly GroceryTrackerContext _context;

    public ItemsController(GroceryTrackerContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ItemSummaryDto>>> GetItems()
    {
        var items = await _context.Items
            .Include(i => i.PriceEntries)
                .ThenInclude(p => p.Store)
            .Include(i => i.PriceEntries)
                .ThenInclude(p => p.User)
            .Where(i => i.IsActive)
            .OrderBy(i => i.Name)
            .ToListAsync();

        var result = items.Select(item =>
        {
            var latestEntriesByStore = item.PriceEntries
                .GroupBy(p => p.StoreId)
                .Select(g => g.OrderByDescending(p => p.RecordedAt).First())
                .OrderBy(p => p.PricePerUnit)
                .ToList();

            var latestPricesByStore = latestEntriesByStore
                .Select(p => new StorePriceDto(
                    p.StoreId,
                    p.Store.Name,
                    p.PricePerUnit,
                    p.TotalPrice,
                    p.Quantity,
                    p.UnitType,
                    p.RecordedAt
                ))
                .ToList();

            var bestEntry = latestEntriesByStore.FirstOrDefault();

            return new ItemSummaryDto(
                item.Id,
                item.Name,
                item.CreatedAt,
                bestEntry != null ? new PriceEntryDto(
                    bestEntry.Id, item.Id, bestEntry.StoreId, bestEntry.Store.Name,
                    bestEntry.UserId, bestEntry.User.Name,
                    bestEntry.Quantity, bestEntry.UnitType, bestEntry.TotalPrice,
                    bestEntry.PricePerUnit, bestEntry.IsOverridden, bestEntry.RecordedAt, bestEntry.CreatedAt
                ) : null,
                latestPricesByStore
            );
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ItemDto>> GetItem(int id)
    {
        var item = await _context.Items
            .Include(i => i.PriceEntries)
                .ThenInclude(p => p.Store)
            .Include(i => i.PriceEntries)
                .ThenInclude(p => p.User)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            return NotFound();
        }

        var priceEntries = item.PriceEntries
            .OrderByDescending(p => p.RecordedAt)
            .Select(p => new PriceEntryDto(
                p.Id, p.ItemId, p.StoreId, p.Store.Name,
                p.UserId, p.User.Name,
                p.Quantity, p.UnitType, p.TotalPrice,
                p.PricePerUnit, p.IsOverridden, p.RecordedAt, p.CreatedAt
            ))
            .ToList();

        return Ok(new ItemDto(item.Id, item.Name, item.CreatedAt, item.IsActive, priceEntries));
    }

    [HttpPost]
    public async Task<ActionResult<ItemDto>> CreateItem([FromBody] CreateItemRequest request)
    {
        var item = new Item
        {
            Name = request.Name,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        await _context.LogChangeAsync("INSERT", item.Id, (Item?)null, item);

        return CreatedAtAction(
            nameof(GetItem),
            new { id = item.Id },
            new ItemDto(item.Id, item.Name, item.CreatedAt, item.IsActive, new List<PriceEntryDto>())
        );
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ItemDto>> UpdateItem(int id, [FromBody] UpdateItemRequest request)
    {
        var item = await _context.Items.FindAsync(id);

        if (item == null)
        {
            return NotFound();
        }

        var oldItem = new Item { Id = item.Id, Name = item.Name, CreatedAt = item.CreatedAt, IsActive = item.IsActive };

        item.Name = request.Name;
        await _context.SaveChangesAsync();

        await _context.LogChangeAsync("UPDATE", item.Id, oldItem, item);

        return Ok(new ItemDto(item.Id, item.Name, item.CreatedAt, item.IsActive, new List<PriceEntryDto>()));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.Items
            .Include(i => i.PriceEntries)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            return NotFound();
        }

        await _context.LogChangeAsync("DELETE", item.Id, item, (Item?)null);

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

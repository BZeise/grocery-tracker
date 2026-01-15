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
            .Where(i => i.IsActive)
            .OrderBy(i => i.Name)
            .ToListAsync();

        var result = items.Select(item =>
        {
            var latestPricesByStore = item.PriceEntries
                .GroupBy(p => p.StoreId)
                .Select(g => g.OrderByDescending(p => p.RecordedAt).First())
                .Select(p => new StorePriceDto(
                    p.StoreId,
                    p.Store.Name,
                    p.PricePerUnit,
                    p.TotalPrice,
                    p.Quantity,
                    p.UnitType,
                    p.RecordedAt
                ))
                .OrderBy(p => p.PricePerUnit)
                .ToList();

            var bestPrice = latestPricesByStore.FirstOrDefault();

            return new ItemSummaryDto(
                item.Id,
                item.Name,
                item.CreatedAt,
                bestPrice != null ? new PriceEntryDto(
                    0, item.Id, bestPrice.StoreId, bestPrice.StoreName,
                    bestPrice.Quantity, bestPrice.UnitType, bestPrice.TotalPrice,
                    bestPrice.PricePerUnit, false, bestPrice.RecordedAt, bestPrice.RecordedAt
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
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            return NotFound();
        }

        var priceEntries = item.PriceEntries
            .OrderByDescending(p => p.RecordedAt)
            .Select(p => new PriceEntryDto(
                p.Id, p.ItemId, p.StoreId, p.Store.Name,
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

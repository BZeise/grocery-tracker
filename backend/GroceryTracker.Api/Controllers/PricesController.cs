using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GroceryTracker.Api.Data;
using GroceryTracker.Api.Models;

namespace GroceryTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PricesController : ControllerBase
{
    private readonly GroceryTrackerContext _context;

    public PricesController(GroceryTrackerContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<PriceEntryDto>> CreatePriceEntry([FromBody] CreatePriceEntryRequest request)
    {
        var item = await _context.Items.FindAsync(request.ItemId);
        if (item == null)
        {
            return BadRequest("Item not found");
        }

        var store = await _context.Stores.FindAsync(request.StoreId);
        if (store == null)
        {
            return BadRequest("Store not found");
        }

        var pricePerUnit = request.PricePerUnit ??
            (request.Quantity > 0 ? request.TotalPrice / request.Quantity : 0);

        var priceEntry = new PriceEntry
        {
            ItemId = request.ItemId,
            StoreId = request.StoreId,
            Quantity = request.Quantity,
            UnitType = request.UnitType,
            TotalPrice = request.TotalPrice,
            PricePerUnit = pricePerUnit,
            IsOverridden = request.PricePerUnit.HasValue,
            RecordedAt = request.RecordedAt ?? DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _context.PriceEntries.Add(priceEntry);
        await _context.SaveChangesAsync();

        await _context.LogChangeAsync("INSERT", priceEntry.Id, (PriceEntry?)null, priceEntry);

        return CreatedAtAction(
            nameof(GetPriceEntry),
            new { id = priceEntry.Id },
            new PriceEntryDto(
                priceEntry.Id, priceEntry.ItemId, priceEntry.StoreId, store.Name,
                priceEntry.Quantity, priceEntry.UnitType, priceEntry.TotalPrice,
                priceEntry.PricePerUnit, priceEntry.IsOverridden, priceEntry.RecordedAt, priceEntry.CreatedAt
            )
        );
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PriceEntryDto>> GetPriceEntry(int id)
    {
        var priceEntry = await _context.PriceEntries
            .Include(p => p.Store)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (priceEntry == null)
        {
            return NotFound();
        }

        return Ok(new PriceEntryDto(
            priceEntry.Id, priceEntry.ItemId, priceEntry.StoreId, priceEntry.Store.Name,
            priceEntry.Quantity, priceEntry.UnitType, priceEntry.TotalPrice,
            priceEntry.PricePerUnit, priceEntry.IsOverridden, priceEntry.RecordedAt, priceEntry.CreatedAt
        ));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PriceEntryDto>> UpdatePriceEntry(int id, [FromBody] UpdatePriceEntryRequest request)
    {
        var priceEntry = await _context.PriceEntries
            .Include(p => p.Store)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (priceEntry == null)
        {
            return NotFound();
        }

        var oldEntry = new PriceEntry
        {
            Id = priceEntry.Id,
            ItemId = priceEntry.ItemId,
            StoreId = priceEntry.StoreId,
            Quantity = priceEntry.Quantity,
            UnitType = priceEntry.UnitType,
            TotalPrice = priceEntry.TotalPrice,
            PricePerUnit = priceEntry.PricePerUnit,
            IsOverridden = priceEntry.IsOverridden,
            RecordedAt = priceEntry.RecordedAt,
            CreatedAt = priceEntry.CreatedAt
        };

        var pricePerUnit = request.PricePerUnit ??
            (request.Quantity > 0 ? request.TotalPrice / request.Quantity : 0);

        priceEntry.Quantity = request.Quantity;
        priceEntry.UnitType = request.UnitType;
        priceEntry.TotalPrice = request.TotalPrice;
        priceEntry.PricePerUnit = pricePerUnit;
        priceEntry.IsOverridden = request.PricePerUnit.HasValue;
        priceEntry.RecordedAt = request.RecordedAt ?? priceEntry.RecordedAt;

        await _context.SaveChangesAsync();

        await _context.LogChangeAsync("UPDATE", priceEntry.Id, oldEntry, priceEntry);

        return Ok(new PriceEntryDto(
            priceEntry.Id, priceEntry.ItemId, priceEntry.StoreId, priceEntry.Store.Name,
            priceEntry.Quantity, priceEntry.UnitType, priceEntry.TotalPrice,
            priceEntry.PricePerUnit, priceEntry.IsOverridden, priceEntry.RecordedAt, priceEntry.CreatedAt
        ));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePriceEntry(int id)
    {
        var priceEntry = await _context.PriceEntries.FindAsync(id);

        if (priceEntry == null)
        {
            return NotFound();
        }

        await _context.LogChangeAsync("DELETE", priceEntry.Id, priceEntry, (PriceEntry?)null);

        _context.PriceEntries.Remove(priceEntry);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

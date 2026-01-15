using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GroceryTracker.Api.Data;
using GroceryTracker.Api.Models;

namespace GroceryTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StoresController : ControllerBase
{
    private readonly GroceryTrackerContext _context;

    public StoresController(GroceryTrackerContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<StoreDto>>> GetStores()
    {
        var stores = await _context.Stores
            .OrderBy(s => s.Name)
            .Select(s => new StoreDto(s.Id, s.Name, s.CreatedAt))
            .ToListAsync();

        return Ok(stores);
    }

    [HttpPost]
    public async Task<ActionResult<StoreDto>> CreateStore([FromBody] CreateStoreRequest request)
    {
        var store = new Store
        {
            Name = request.Name,
            CreatedAt = DateTime.UtcNow
        };

        _context.Stores.Add(store);
        await _context.SaveChangesAsync();

        await _context.LogChangeAsync("INSERT", store.Id, (Store?)null, store);

        return CreatedAtAction(nameof(GetStores), new StoreDto(store.Id, store.Name, store.CreatedAt));
    }
}

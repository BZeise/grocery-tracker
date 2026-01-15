using Microsoft.AspNetCore.Mvc;
using GroceryTracker.Api.Models;

namespace GroceryTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private const string ValidPassword = "2975";

    [HttpPost("verify")]
    public ActionResult<AuthResponse> Verify([FromBody] VerifyPasswordRequest request)
    {
        if (request.Password == ValidPassword)
        {
            return Ok(new AuthResponse(true));
        }

        return Ok(new AuthResponse(false, "Invalid password"));
    }
}

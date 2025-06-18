using Microsoft.AspNetCore.Mvc;

namespace LearnHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet]
    public ActionResult<string> Get()
    {
        return Ok("API is working!");
    }

    [HttpGet("health")]
    public ActionResult<object> Health()
    {
        return Ok(new { 
            status = "healthy", 
            timestamp = DateTime.UtcNow,
            version = "1.0.0"
        });
    }
}
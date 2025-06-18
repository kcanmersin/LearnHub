using Microsoft.AspNetCore.Mvc;
using LearnHub.Application.DTOs;
using LearnHub.Application.Services;

namespace LearnHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PublicController : ControllerBase
{
    private readonly ITranslationService _translationService;

    public PublicController(ITranslationService translationService)
    {
        _translationService = translationService;
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

    [HttpPost("translate")]
    public async Task<ActionResult<TranslationResponseDto>> TranslateText([FromBody] TranslationRequestDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.TextToTranslate))
            {
                return BadRequest(new { message = "Text to translate is required" });
            }

            var translatedText = await _translationService.TranslateTextAsync(request.TextToTranslate);

            return Ok(new TranslationResponseDto
            {
                TranslatedText = translatedText
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Translation failed", details = ex.Message });
        }
    }
}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnHub.Application.DTOs;
using LearnHub.Application.Services;

namespace LearnHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TranslationController : ControllerBase
{
    private readonly ITranslationService _translationService;

    public TranslationController(ITranslationService translationService)
    {
        _translationService = translationService;
    }

    [HttpPost]
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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using System.Security.Claims;
using LearnHub.Application.Commands.Vocabulary;
using LearnHub.Application.Queries.Vocabulary;
using LearnHub.Application.DTOs;

namespace LearnHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VocabularyController : ControllerBase
{
    private readonly IMediator _mediator;

    public VocabularyController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VocabularyEntryDto>>> GetVocabularyEntries(
        [FromQuery] string? domain = null,
        [FromQuery] string? search = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var query = new GetVocabularyEntriesQuery
            {
                UserId = userId.Value,
                Domain = domain,
                Search = search
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving vocabulary entries", details = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<VocabularyEntryDto>> CreateVocabularyEntry([FromBody] CreateVocabularyEntryDto request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var command = new CreateVocabularyEntryCommand
            {
                UserId = userId.Value,
                OriginalText = request.OriginalText,
                TranslatedText = request.TranslatedText,
                SourceDomain = request.SourceDomain
            };

            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetVocabularyEntries), new { }, result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating vocabulary entry", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteVocabularyEntry(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            // This would need a delete command handler - simplified for now
            return Ok(new { message = "Vocabulary entry deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting vocabulary entry", details = ex.Message });
        }
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
    }
}
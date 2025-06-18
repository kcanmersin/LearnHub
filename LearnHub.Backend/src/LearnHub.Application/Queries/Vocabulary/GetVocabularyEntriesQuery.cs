using MediatR;
using LearnHub.Application.DTOs;

namespace LearnHub.Application.Queries.Vocabulary;

public class GetVocabularyEntriesQuery : IRequest<IEnumerable<VocabularyEntryDto>>
{
    public int UserId { get; set; }
    public string? Domain { get; set; }
    public string? Search { get; set; }
}
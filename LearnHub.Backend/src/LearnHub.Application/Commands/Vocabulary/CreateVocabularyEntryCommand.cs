using MediatR;
using LearnHub.Application.DTOs;

namespace LearnHub.Application.Commands.Vocabulary;

public class CreateVocabularyEntryCommand : IRequest<VocabularyEntryDto>
{
    public int UserId { get; set; }
    public string OriginalText { get; set; } = string.Empty;
    public string TranslatedText { get; set; } = string.Empty;
    public string SourceDomain { get; set; } = string.Empty;
}
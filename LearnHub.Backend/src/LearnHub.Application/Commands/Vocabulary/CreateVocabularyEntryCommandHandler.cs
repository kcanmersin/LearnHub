using MediatR;
using LearnHub.Application.DTOs;
using LearnHub.Domain.Entities;
using LearnHub.Domain.Interfaces;

namespace LearnHub.Application.Commands.Vocabulary;

public class CreateVocabularyEntryCommandHandler : IRequestHandler<CreateVocabularyEntryCommand, VocabularyEntryDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateVocabularyEntryCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<VocabularyEntryDto> Handle(CreateVocabularyEntryCommand request, CancellationToken cancellationToken)
    {
        var vocabularyEntry = new VocabularyEntry
        {
            UserId = request.UserId,
            OriginalText = request.OriginalText,
            TranslatedText = request.TranslatedText,
            SourceDomain = request.SourceDomain,
            TranslationDate = DateTime.UtcNow
        };

        await _unitOfWork.VocabularyEntries.AddAsync(vocabularyEntry);
        await _unitOfWork.SaveChangesAsync();

        return new VocabularyEntryDto
        {
            Id = vocabularyEntry.Id,
            OriginalText = vocabularyEntry.OriginalText,
            TranslatedText = vocabularyEntry.TranslatedText,
            SourceDomain = vocabularyEntry.SourceDomain,
            TranslationDate = vocabularyEntry.TranslationDate
        };
    }
}
using MediatR;
using LearnHub.Application.DTOs;
using LearnHub.Domain.Interfaces;

namespace LearnHub.Application.Queries.Vocabulary;

public class GetVocabularyEntriesQueryHandler : IRequestHandler<GetVocabularyEntriesQuery, IEnumerable<VocabularyEntryDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetVocabularyEntriesQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<VocabularyEntryDto>> Handle(GetVocabularyEntriesQuery request, CancellationToken cancellationToken)
    {
        var vocabularyEntries = await _unitOfWork.VocabularyEntries.FindAsync(v => v.UserId == request.UserId);

        var filteredEntries = vocabularyEntries.AsQueryable();

        if (!string.IsNullOrEmpty(request.Domain))
        {
            filteredEntries = filteredEntries.Where(v => v.SourceDomain.Contains(request.Domain));
        }

        if (!string.IsNullOrEmpty(request.Search))
        {
            filteredEntries = filteredEntries.Where(v => 
                v.OriginalText.Contains(request.Search) || 
                v.TranslatedText.Contains(request.Search));
        }

        return filteredEntries.Select(v => new VocabularyEntryDto
        {
            Id = v.Id,
            OriginalText = v.OriginalText,
            TranslatedText = v.TranslatedText,
            SourceDomain = v.SourceDomain,
            TranslationDate = v.TranslationDate
        }).OrderByDescending(v => v.TranslationDate);
    }
}
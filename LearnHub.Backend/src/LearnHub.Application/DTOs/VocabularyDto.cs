namespace LearnHub.Application.DTOs;

public class VocabularyEntryDto
{
    public int Id { get; set; }
    public string OriginalText { get; set; } = string.Empty;
    public string TranslatedText { get; set; } = string.Empty;
    public string SourceDomain { get; set; } = string.Empty;
    public DateTime TranslationDate { get; set; }
}

public class CreateVocabularyEntryDto
{
    public string OriginalText { get; set; } = string.Empty;
    public string TranslatedText { get; set; } = string.Empty;
    public string SourceDomain { get; set; } = string.Empty;
}

public class TranslationRequestDto
{
    public string TextToTranslate { get; set; } = string.Empty;
}

public class TranslationResponseDto
{
    public string TranslatedText { get; set; } = string.Empty;
}
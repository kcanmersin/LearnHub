namespace LearnHub.Domain.Entities;

public class VocabularyEntry
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string OriginalText { get; set; } = string.Empty;
    public string TranslatedText { get; set; } = string.Empty;
    public string SourceDomain { get; set; } = string.Empty;
    public DateTime TranslationDate { get; set; } = DateTime.UtcNow;
    
    public virtual User User { get; set; } = null!;
}
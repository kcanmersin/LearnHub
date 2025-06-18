namespace LearnHub.Application.Services;

public interface ITranslationService
{
    Task<string> TranslateTextAsync(string text);
}
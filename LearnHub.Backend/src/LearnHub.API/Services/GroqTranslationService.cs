using System.Text;
using System.Text.Json;
using LearnHub.Application.Services;

namespace LearnHub.API.Services;

public class GroqTranslationService : ITranslationService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public GroqTranslationService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> TranslateTextAsync(string text)
    {
        var apiKey = _configuration["GROQ_API_KEY"] ?? throw new InvalidOperationException("GROQ_API_KEY not configured");
        var apiUrl = _configuration["GROQ_API_URL"] ?? "https://api.groq.com/openai/v1/chat/completions";
        var model = _configuration["GROQ_MODEL"] ?? "llama-3.3-70b-versatile";

        var requestBody = new
        {
            model = model,
            messages = new[]
            {
                new
                {
                    role = "system",
                    content = "You are a professional translator. Translate the given text to Turkish. Only return the translated text without any explanations or additional comments."
                },
                new
                {
                    role = "user",
                    content = $"Translate this text to Turkish: {text}"
                }
            },
            temperature = 0.3,
            max_tokens = 1000
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

        try
        {
            var response = await _httpClient.PostAsync(apiUrl, content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Groq API request failed: {response.StatusCode} - {errorContent}");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            var responseObject = JsonSerializer.Deserialize<JsonElement>(responseJson);

            var translatedText = responseObject
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return translatedText?.Trim() ?? text;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Translation failed: {ex.Message}", ex);
        }
    }
}
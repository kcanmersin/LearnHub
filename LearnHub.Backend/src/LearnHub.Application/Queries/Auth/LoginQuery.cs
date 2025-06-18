using MediatR;
using LearnHub.Application.DTOs;

namespace LearnHub.Application.Queries.Auth;

public class LoginQuery : IRequest<LoginResponseDto>
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
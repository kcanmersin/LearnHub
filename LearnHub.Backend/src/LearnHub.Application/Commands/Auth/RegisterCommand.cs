using MediatR;
using LearnHub.Application.DTOs;

namespace LearnHub.Application.Commands.Auth;

public class RegisterCommand : IRequest<UserDto>
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
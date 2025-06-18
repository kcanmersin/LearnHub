using MediatR;
using BCrypt.Net;
using LearnHub.Application.DTOs;
using LearnHub.Application.Services;
using LearnHub.Domain.Interfaces;

namespace LearnHub.Application.Queries.Auth;

public class LoginQueryHandler : IRequestHandler<LoginQuery, LoginResponseDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;

    public LoginQueryHandler(IUnitOfWork unitOfWork, IJwtService jwtService)
    {
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
    }

    public async Task<LoginResponseDto> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.Users.SingleOrDefaultAsync(u => u.Username == request.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid username or password");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("User account is inactive");
        }

        var token = _jwtService.GenerateToken(user.Id.ToString(), user.Username);

        return new LoginResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                IsActive = user.IsActive
            }
        };
    }
}
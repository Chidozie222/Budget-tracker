# Advanced Identity & JWT Features - C# Guide

## Table of Contents
1. [Refresh Tokens](#refresh-tokens)
2. [Email Confirmation](#email-confirmation)
3. [Two-Factor Authentication (2FA)](#two-factor-authentication-2fa)
4. [Password Reset](#password-reset)
5. [External Login Providers](#external-login-providers)
6. [Claims-Based Authorization](#claims-based-authorization)
7. [Complete Advanced Example](#complete-advanced-example)

---

## Refresh Tokens

Refresh tokens allow users to obtain new access tokens without re-authenticating. This is crucial for maintaining user sessions securely.

### Why Use Refresh Tokens?

- **Short-lived Access Tokens**: Keep access tokens short-lived (15-30 minutes)
- **Long-lived Sessions**: Allow users to stay logged in for days/weeks
- **Revocable**: Can be revoked server-side if compromised
- **Better Security**: Stolen access tokens expire quickly

### Implementation

**1. Create RefreshToken Model:**

```csharp
public class RefreshToken
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsRevoked { get; set; }
    public string? ReplacedByToken { get; set; }
    public string? CreatedByIp { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? RevokedByIp { get; set; }

    // Navigation property
    public ApplicationUser User { get; set; } = null!;

    public bool IsActive => !IsRevoked && DateTime.UtcNow < ExpiresAt;
}
```

**2. Update ApplicationDbContext:**

```csharp
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
```

**3. Update TokenService:**

```csharp
using System.Security.Cryptography;

public interface ITokenService
{
    string GenerateAccessToken(ApplicationUser user, IList<string> roles);
    RefreshToken GenerateRefreshToken(string userId, string ipAddress);
    ClaimsPrincipal? ValidateToken(string token);
}

public class TokenService : ITokenService
{
    private readonly JwtSettings _jwtSettings;

    public TokenService(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
    }

    public string GenerateAccessToken(ApplicationUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName ?? "")
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public RefreshToken GenerateRefreshToken(string userId, string ipAddress)
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);

        return new RefreshToken
        {
            UserId = userId,
            Token = Convert.ToBase64String(randomBytes),
            ExpiresAt = DateTime.UtcNow.AddDays(7), // 7 days
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = ipAddress
        };
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtSettings.Secret);

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = false, // Don't validate lifetime for refresh
                ValidateIssuerSigningKey = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidAudience = _jwtSettings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            return principal;
        }
        catch
        {
            return null;
        }
    }
}
```

**4. Update DTOs:**

```csharp
public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}
```

**5. Update AuthController:**

```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly ApplicationDbContext _context;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService,
        ApplicationDbContext context)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _context = context;
    }

    private string GetIpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
            return Request.Headers["X-Forwarded-For"].ToString();
        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Unauthorized(new ErrorResponse { Message = "Invalid credentials" });

        var result = await _signInManager.CheckPasswordSignInAsync(
            user, request.Password, lockoutOnFailure: true);

        if (!result.Succeeded)
            return Unauthorized(new ErrorResponse { Message = "Invalid credentials" });

        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user, roles);
        var refreshToken = _tokenService.GenerateRefreshToken(user.Id, GetIpAddress());

        // Save refresh token to database
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return Ok(new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            Email = user.Email!,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60)
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var refreshToken = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

        if (refreshToken == null || !refreshToken.IsActive)
            return Unauthorized(new ErrorResponse { Message = "Invalid refresh token" });

        var user = refreshToken.User;
        var roles = await _userManager.GetRolesAsync(user);

        // Generate new tokens
        var newAccessToken = _tokenService.GenerateAccessToken(user, roles);
        var newRefreshToken = _tokenService.GenerateRefreshToken(user.Id, GetIpAddress());

        // Revoke old refresh token
        refreshToken.IsRevoked = true;
        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.RevokedByIp = GetIpAddress();
        refreshToken.ReplacedByToken = newRefreshToken.Token;

        // Save new refresh token
        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync();

        return Ok(new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken.Token,
            Email = user.Email!,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60)
        });
    }

    [HttpPost("revoke")]
    [Authorize]
    public async Task<IActionResult> Revoke([FromBody] RefreshTokenRequest request)
    {
        var refreshToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

        if (refreshToken == null)
            return NotFound(new ErrorResponse { Message = "Token not found" });

        if (refreshToken.IsRevoked)
            return BadRequest(new ErrorResponse { Message = "Token already revoked" });

        // Revoke token
        refreshToken.IsRevoked = true;
        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.RevokedByIp = GetIpAddress();

        await _context.SaveChangesAsync();

        return Ok(new { Message = "Token revoked successfully" });
    }
}
```

---

## Email Confirmation

Email confirmation ensures users own the email address they register with.

### Implementation

**1. Configure Email Service Interface:**

```csharp
public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
}

// Simple implementation using SMTP (for production, use SendGrid, AWS SES, etc.)
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        using var client = new SmtpClient();
        client.Host = _configuration["EmailSettings:SmtpHost"] ?? "smtp.gmail.com";
        client.Port = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
        client.EnableSsl = true;
        client.Credentials = new NetworkCredential(
            _configuration["EmailSettings:Username"],
            _configuration["EmailSettings:Password"]
        );

        var message = new MailMessage(
            from: _configuration["EmailSettings:FromEmail"] ?? "noreply@example.com",
            to: to,
            subject: subject,
            body: body
        );
        message.IsBodyHtml = true;

        await client.SendMailAsync(message);
    }
}
```

**2. Add Email Settings to appsettings.json:**

```json
{
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "Username": "your-email@gmail.com",
    "Password": "your-app-password",
    "FromEmail": "noreply@yourapp.com"
  }
}
```

**3. Register Email Service:**

```csharp
builder.Services.AddScoped<IEmailService, EmailService>();
```

**4. Update AuthController for Email Confirmation:**

```csharp
[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterRequest request)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    var user = new ApplicationUser
    {
        UserName = request.Email,
        Email = request.Email,
        FirstName = request.FirstName,
        LastName = request.LastName
    };

    var result = await _userManager.CreateAsync(user, request.Password);

    if (!result.Succeeded)
    {
        return BadRequest(new ErrorResponse
        {
            Message = "Registration failed",
            Errors = result.Errors.Select(e => e.Description).ToList()
        });
    }

    await _userManager.AddToRoleAsync(user, "User");

    // Generate email confirmation token
    var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
    var encodedToken = WebUtility.UrlEncode(token);
    var confirmationLink = $"{Request.Scheme}://{Request.Host}/api/auth/confirm-email?userId={user.Id}&token={encodedToken}";

    // Send confirmation email
    await _emailService.SendEmailAsync(
        user.Email!,
        "Confirm your email",
        $"Please confirm your email by clicking this link: <a href='{confirmationLink}'>Confirm Email</a>"
    );

    return Ok(new
    {
        Message = "Registration successful. Please check your email to confirm your account."
    });
}

[HttpGet("confirm-email")]
public async Task<IActionResult> ConfirmEmail(string userId, string token)
{
    if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
        return BadRequest("Invalid confirmation link");

    var user = await _userManager.FindByIdAsync(userId);
    if (user == null)
        return NotFound("User not found");

    var decodedToken = WebUtility.UrlDecode(token);
    var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

    if (!result.Succeeded)
        return BadRequest("Email confirmation failed");

    return Ok("Email confirmed successfully! You can now log in.");
}

[HttpPost("resend-confirmation")]
public async Task<IActionResult> ResendConfirmation([FromBody] ResendConfirmationRequest request)
{
    var user = await _userManager.FindByEmailAsync(request.Email);
    if (user == null)
        return Ok("If an account exists, a confirmation email has been sent.");

    if (user.EmailConfirmed)
        return BadRequest("Email already confirmed");

    var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
    var encodedToken = WebUtility.UrlEncode(token);
    var confirmationLink = $"{Request.Scheme}://{Request.Host}/api/auth/confirm-email?userId={user.Id}&token={encodedToken}";

    await _emailService.SendEmailAsync(
        user.Email!,
        "Confirm your email",
        $"Please confirm your email by clicking this link: <a href='{confirmationLink}'>Confirm Email</a>"
    );

    return Ok("Confirmation email sent");
}
```

**5. Update Login to Check Email Confirmation:**

```csharp
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    var user = await _userManager.FindByEmailAsync(request.Email);
    if (user == null)
        return Unauthorized(new ErrorResponse { Message = "Invalid credentials" });

    // Check if email is confirmed
    if (!user.EmailConfirmed)
    {
        return Unauthorized(new ErrorResponse
        {
            Message = "Please confirm your email before logging in"
        });
    }

    var result = await _signInManager.CheckPasswordSignInAsync(
        user, request.Password, lockoutOnFailure: true);

    if (!result.Succeeded)
        return Unauthorized(new ErrorResponse { Message = "Invalid credentials" });

    // Rest of login code...
}
```

---

## Two-Factor Authentication (2FA)

2FA adds an extra layer of security by requiring a second verification method.

### Implementation with Authenticator App (TOTP)

**1. Install QR Code Package:**

```bash
dotnet add package QRCoder
```

**2. Create 2FA DTOs:**

```csharp
public class Enable2faResponse
{
    public string QrCodeUrl { get; set; } = string.Empty;
    public string ManualEntryKey { get; set; } = string.Empty;
}

public class Verify2faRequest
{
    public string Code { get; set; } = string.Empty;
}

public class LoginWith2faRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string TwoFactorCode { get; set; } = string.Empty;
}
```

**3. Add 2FA Controller:**

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TwoFactorController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public TwoFactorController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpPost("enable")]
    public async Task<IActionResult> Enable2fa()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _userManager.FindByIdAsync(userId!);

        if (user == null)
            return NotFound();

        // Generate key for authenticator app
        await _userManager.ResetAuthenticatorKeyAsync(user);
        var key = await _userManager.GetAuthenticatorKeyAsync(user);

        if (string.IsNullOrEmpty(key))
        {
            await _userManager.ResetAuthenticatorKeyAsync(user);
            key = await _userManager.GetAuthenticatorKeyAsync(user);
        }

        // Generate QR code
        var email = await _userManager.GetEmailAsync(user);
        var qrCodeUrl = GenerateQrCodeUri(email!, key!);

        return Ok(new Enable2faResponse
        {
            QrCodeUrl = qrCodeUrl,
            ManualEntryKey = FormatKey(key!)
        });
    }

    [HttpPost("verify")]
    public async Task<IActionResult> Verify2fa([FromBody] Verify2faRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _userManager.FindByIdAsync(userId!);

        if (user == null)
            return NotFound();

        // Verify the code
        var isValid = await _userManager.VerifyTwoFactorTokenAsync(
            user, _userManager.Options.Tokens.AuthenticatorTokenProvider, request.Code);

        if (!isValid)
            return BadRequest(new ErrorResponse { Message = "Invalid verification code" });

        // Enable 2FA
        await _userManager.SetTwoFactorEnabledAsync(user, true);

        // Generate recovery codes
        var recoveryCodes = await _userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 10);

        return Ok(new
        {
            Message = "2FA enabled successfully",
            RecoveryCodes = recoveryCodes
        });
    }

    [HttpPost("disable")]
    public async Task<IActionResult> Disable2fa()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _userManager.FindByIdAsync(userId!);

        if (user == null)
            return NotFound();

        var result = await _userManager.SetTwoFactorEnabledAsync(user, false);

        if (!result.Succeeded)
            return BadRequest(new ErrorResponse { Message = "Failed to disable 2FA" });

        return Ok(new { Message = "2FA disabled successfully" });
    }

    [HttpGet("status")]
    public async Task<IActionResult> Get2faStatus()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _userManager.FindByIdAsync(userId!);

        if (user == null)
            return NotFound();

        var is2faEnabled = await _userManager.GetTwoFactorEnabledAsync(user);
        var recoveryCodesLeft = await _userManager.CountRecoveryCodesAsync(user);

        return Ok(new
        {
            Is2faEnabled = is2faEnabled,
            RecoveryCodesLeft = recoveryCodesLeft
        });
    }

    private string GenerateQrCodeUri(string email, string key)
    {
        const string authenticatorUriFormat = "otpauth://totp/{0}:{1}?secret={2}&issuer={0}&digits=6";
        return string.Format(
            authenticatorUriFormat,
            WebUtility.UrlEncode("YourAppName"),
            WebUtility.UrlEncode(email),
            key);
    }

    private string FormatKey(string key)
    {
        var result = new StringBuilder();
        int currentPosition = 0;
        while (currentPosition + 4 < key.Length)
        {
            result.Append(key.Substring(currentPosition, 4)).Append(' ');
            currentPosition += 4;
        }
        if (currentPosition < key.Length)
        {
            result.Append(key.Substring(currentPosition));
        }
        return result.ToString().ToLowerInvariant();
    }
}
```

**4. Update Login to Handle 2FA:**

```csharp
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    var user = await _userManager.FindByEmailAsync(request.Email);
    if (user == null)
        return Unauthorized(new ErrorResponse { Message = "Invalid credentials" });

    if (!user.EmailConfirmed)
    {
        return Unauthorized(new ErrorResponse
        {
            Message = "Please confirm your email before logging in"
        });
    }

    var result = await _signInManager.CheckPasswordSignInAsync(
        user, request.Password, lockoutOnFailure: true);

    if (!result.Succeeded)
    {
        if (result.RequiresTwoFactor)
        {
            return Ok(new
            {
                RequiresTwoFactor = true,
                Message = "Please provide your 2FA code"
            });
        }
        return Unauthorized(new ErrorResponse { Message = "Invalid credentials" });
    }

    // Rest of login code to generate tokens...
}

[HttpPost("login-2fa")]
public async Task<IActionResult> LoginWith2fa([FromBody] LoginWith2faRequest request)
{
    var user = await _userManager.FindByEmailAsync(request.Email);
    if (user == null)
        return Unauthorized(new ErrorResponse { Message = "Invalid credentials" });

    // Verify password first
    var passwordResult = await _signInManager.CheckPasswordSignInAsync(
        user, request.Password, lockoutOnFailure: false);

    if (!passwordResult.Succeeded)
        return Unauthorized(new ErrorResponse { Message = "Invalid credentials" });

    // Verify 2FA code
    var isValid = await _userManager.VerifyTwoFactorTokenAsync(
        user, _userManager.Options.Tokens.AuthenticatorTokenProvider, request.TwoFactorCode);

    if (!isValid)
    {
        // Try recovery code
        var recoveryResult = await _userManager.RedeemTwoFactorRecoveryCodeAsync(user, request.TwoFactorCode);
        if (!recoveryResult.Succeeded)
        {
            return Unauthorized(new ErrorResponse { Message = "Invalid 2FA code" });
        }
    }

    // Generate tokens
    var roles = await _userManager.GetRolesAsync(user);
    var accessToken = _tokenService.GenerateAccessToken(user, roles);
    var refreshToken = _tokenService.GenerateRefreshToken(user.Id, GetIpAddress());

    _context.RefreshTokens.Add(refreshToken);
    await _context.SaveChangesAsync();

    return Ok(new AuthResponse
    {
        AccessToken = accessToken,
        RefreshToken = refreshToken.Token,
        Email = user.Email!,
        UserId = user.Id,
        ExpiresAt = DateTime.UtcNow.AddMinutes(60)
    });
}
```

---

## Password Reset

**1. Create DTOs:**

```csharp
public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}
```

**2. Add Password Reset Endpoints:**

```csharp
[HttpPost("forgot-password")]
[AllowAnonymous]
public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
{
    var user = await _userManager.FindByEmailAsync(request.Email);
    
    // Always return success to prevent email enumeration
    if (user == null || !user.EmailConfirmed)
    {
        return Ok(new { Message = "If your email is registered, you will receive a password reset link." });
    }

    var token = await _userManager.GeneratePasswordResetTokenAsync(user);
    var encodedToken = WebUtility.UrlEncode(token);
    var resetLink = $"{Request.Scheme}://{Request.Host}/reset-password?email={user.Email}&token={encodedToken}";

    await _emailService.SendEmailAsync(
        user.Email!,
        "Reset Your Password",
        $"Click here to reset your password: <a href='{resetLink}'>Reset Password</a>"
    );

    return Ok(new { Message = "If your email is registered, you will receive a password reset link." });
}

[HttpPost("reset-password")]
[AllowAnonymous]
public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
{
    var user = await _userManager.FindByEmailAsync(request.Email);
    if (user == null)
        return BadRequest(new ErrorResponse { Message = "Invalid request" });

    var decodedToken = WebUtility.UrlDecode(request.Token);
    var result = await _userManager.ResetPasswordAsync(user, decodedToken, request.NewPassword);

    if (!result.Succeeded)
    {
        return BadRequest(new ErrorResponse
        {
            Message = "Password reset failed",
            Errors = result.Errors.Select(e => e.Description).ToList()
        });
    }

    return Ok(new { Message = "Password reset successful" });
}

[HttpPost("change-password")]
[Authorize]
public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var user = await _userManager.FindByIdAsync(userId!);

    if (user == null)
        return NotFound();

    var result = await _userManager.ChangePasswordAsync(
        user, request.CurrentPassword, request.NewPassword);

    if (!result.Succeeded)
    {
        return BadRequest(new ErrorResponse
        {
            Message = "Password change failed",
            Errors = result.Errors.Select(e => e.Description).ToList()
        });
    }

    return Ok(new { Message = "Password changed successfully" });
}
```

---

## External Login Providers

### Google Authentication Example

**1. Install Package:**

```bash
dotnet add package Microsoft.AspNetCore.Authentication.Google
```

**2. Configure in Program.cs:**

```csharp
builder.Services.AddAuthentication()
    .AddJwtBearer(/* existing JWT config */)
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
    });
```

**3. Add to appsettings.json:**

```json
{
  "Authentication": {
    "Google": {
      "ClientId": "your-google-client-id",
      "ClientSecret": "your-google-client-secret"
    }
  }
}
```

**4. Add External Login Endpoints:**

```csharp
[HttpGet("external-login/{provider}")]
[AllowAnonymous]
public IActionResult ExternalLogin(string provider, string returnUrl = "/")
{
    var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Auth", new { returnUrl });
    var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
    return Challenge(properties, provider);
}

[HttpGet("external-login-callback")]
[AllowAnonymous]
public async Task<IActionResult> ExternalLoginCallback(string? returnUrl = null, string? remoteError = null)
{
    if (remoteError != null)
        return BadRequest($"Error from external provider: {remoteError}");

    var info = await _signInManager.GetExternalLoginInfoAsync();
    if (info == null)
        return BadRequest("Error loading external login information");

    // Sign in the user with this external login provider if the user already has a login
    var result = await _signInManager.ExternalLoginSignInAsync(
        info.LoginProvider, info.ProviderKey, isPersistent: false, bypassTwoFactor: true);

    if (result.Succeeded)
    {
        // Generate JWT tokens
        var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
        var roles = await _userManager.GetRolesAsync(user!);
        var accessToken = _tokenService.GenerateAccessToken(user!, roles);
        var refreshToken = _tokenService.GenerateRefreshToken(user!.Id, GetIpAddress());

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return Ok(new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            Email = user!.Email!,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60)
        });
    }

    // If the user doesn't have an account, create one
    var email = info.Principal.FindFirstValue(ClaimTypes.Email);
    if (string.IsNullOrEmpty(email))
        return BadRequest("Email claim not received from external provider");

    var newUser = new ApplicationUser
    {
        UserName = email,
        Email = email,
        EmailConfirmed = true // Email is confirmed by the external provider
    };

    var createResult = await _userManager.CreateAsync(newUser);
    if (!createResult.Succeeded)
        return BadRequest(createResult.Errors);

    var addLoginResult = await _userManager.AddLoginAsync(newUser, info);
    if (!addLoginResult.Succeeded)
        return BadRequest(addLoginResult.Errors);

    await _userManager.AddToRoleAsync(newUser, "User");

    // Generate tokens for new user
    var userRoles = await _userManager.GetRolesAsync(newUser);
    var token = _tokenService.GenerateAccessToken(newUser, userRoles);
    var refresh = _tokenService.GenerateRefreshToken(newUser.Id, GetIpAddress());

    _context.RefreshTokens.Add(refresh);
    await _context.SaveChangesAsync();

    return Ok(new AuthResponse
    {
        AccessToken = token,
        RefreshToken = refresh.Token,
        Email = newUser.Email!,
        UserId = newUser.Id,
        ExpiresAt = DateTime.UtcNow.AddMinutes(60)
    });
}
```

---

## Claims-Based Authorization

Claims provide fine-grained authorization beyond simple roles.

**1. Define Custom Claims:**

```csharp
public static class CustomClaimTypes
{
    public const string Permission = "Permission";
    public const string Department = "Department";
    public const string TenantId = "TenantId";
}

public static class Permissions
{
    public const string ViewUsers = "Permissions.Users.View";
    public const string CreateUsers = "Permissions.Users.Create";
    public const string EditUsers = "Permissions.Users.Edit";
    public const string DeleteUsers = "Permissions.Users.Delete";
    
    public const string ViewReports = "Permissions.Reports.View";
    public const string CreateReports = "Permissions.Reports.Create";
}
```

**2. Add Claims to Users:**

```csharp
[HttpPost("add-claims")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> AddClaimsToUser([FromBody] AddClaimsRequest request)
{
    var user = await _userManager.FindByIdAsync(request.UserId);
    if (user == null)
        return NotFound();

    var claims = new List<Claim>
    {
        new Claim(CustomClaimTypes.Department, request.Department),
        new Claim(CustomClaimTypes.Permission, Permissions.ViewUsers),
        new Claim(CustomClaimTypes.Permission, Permissions.EditUsers)
    };

    var result = await _userManager.AddClaimsAsync(user, claims);

    if (!result.Succeeded)
        return BadRequest(result.Errors);

    return Ok(new { Message = "Claims added successfully" });
}
```

**3. Create Custom Authorization Policies:**

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanViewUsers", policy =>
        policy.RequireClaim(CustomClaimTypes.Permission, Permissions.ViewUsers));

    options.AddPolicy("CanCreateUsers", policy =>
        policy.RequireClaim(CustomClaimTypes.Permission, Permissions.CreateUsers));

    options.AddPolicy("CanEditUsers", policy =>
        policy.RequireClaim(CustomClaimTypes.Permission, Permissions.EditUsers));

    options.AddPolicy("ITDepartment", policy =>
        policy.RequireClaim(CustomClaimTypes.Department, "IT"));

    options.AddPolicy("CanDeleteUsers", policy =>
        policy.RequireRole("Admin")
              .RequireClaim(CustomClaimTypes.Permission, Permissions.DeleteUsers));
});
```

**4. Use Policies in Controllers:**

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    [HttpGet("users")]
    [Authorize(Policy = "CanViewUsers")]
    public IActionResult GetUsers()
    {
        return Ok("List of users");
    }

    [HttpPost("users")]
    [Authorize(Policy = "CanCreateUsers")]
    public IActionResult CreateUser()
    {
        return Ok("User created");
    }

    [HttpPut("users/{id}")]
    [Authorize(Policy = "CanEditUsers")]
    public IActionResult EditUser(string id)
    {
        return Ok($"User {id} edited");
    }

    [HttpDelete("users/{id}")]
    [Authorize(Policy = "CanDeleteUsers")]
    public IActionResult DeleteUser(string id)
    {
        return Ok($"User {id} deleted");
    }

    [HttpGet("it-resources")]
    [Authorize(Policy = "ITDepartment")]
    public IActionResult GetITResources()
    {
        return Ok("IT Department resources");
    }
}
```

**5. Custom Authorization Handler:**

```csharp
public class MinimumAgeRequirement : IAuthorizationRequirement
{
    public int MinimumAge { get; }

    public MinimumAgeRequirement(int minimumAge)
    {
        MinimumAge = minimumAge;
    }
}

public class MinimumAgeHandler : AuthorizationHandler<MinimumAgeRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        MinimumAgeRequirement requirement)
    {
        var dateOfBirthClaim = context.User.FindFirst(c => c.Type == ClaimTypes.DateOfBirth);

        if (dateOfBirthClaim == null)
            return Task.CompletedTask;

        var dateOfBirth = Convert.ToDateTime(dateOfBirthClaim.Value);
        int age = DateTime.Today.Year - dateOfBirth.Year;

        if (dateOfBirth > DateTime.Today.AddYears(-age))
            age--;

        if (age >= requirement.MinimumAge)
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}

// Register in Program.cs
builder.Services.AddSingleton<IAuthorizationHandler, MinimumAgeHandler>();
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AtLeast18", policy =>
        policy.Requirements.Add(new MinimumAgeRequirement(18)));
});
```

---

## Complete Advanced Example

### Complete Program.cs with All Features

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = true;
    options.Tokens.AuthenticatorTokenProvider = TokenOptions.DefaultAuthenticatorProvider;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// JWT Settings
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings!.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings.Secret)),
        ClockSkew = TimeSpan.Zero
    };
})
.AddGoogle(options =>
{
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
});

// Authorization with Custom Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanViewUsers", policy =>
        policy.RequireClaim(CustomClaimTypes.Permission, Permissions.ViewUsers));
    options.AddPolicy("CanCreateUsers", policy =>
        policy.RequireClaim(CustomClaimTypes.Permission, Permissions.CreateUsers));
    options.AddPolicy("AtLeast18", policy =>
        policy.Requirements.Add(new MinimumAgeRequirement(18)));
});

// Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddSingleton<IAuthorizationHandler, MinimumAgeHandler>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

var app = builder.Build();

// Seed roles and admin user
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

    string[] roles = { "Admin", "User", "Manager" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    // Create admin user
    var adminEmail = "admin@example.com";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null)
    {
        adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            EmailConfirmed = true,
            FirstName = "Admin",
            LastName = "User"
        };
        await userManager.CreateAsync(adminUser, "Admin123!");
        await userManager.AddToRoleAsync(adminUser, "Admin");
        
        // Add admin claims
        await userManager.AddClaimsAsync(adminUser, new[]
        {
            new Claim(CustomClaimTypes.Permission, Permissions.ViewUsers),
            new Claim(CustomClaimTypes.Permission, Permissions.CreateUsers),
            new Claim(CustomClaimTypes.Permission, Permissions.EditUsers),
            new Claim(CustomClaimTypes.Permission, Permissions.DeleteUsers)
        });
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

## Testing the Advanced Features

### 1. Register with Email Confirmation
```bash
POST /api/auth/register
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 2. Confirm Email
```bash
GET /api/auth/confirm-email?userId={userId}&token={token}
```

### 3. Login and Get Tokens
```bash
POST /api/auth/login
{
  "email": "newuser@example.com",
  "password": "Password123!"
}
```

### 4. Refresh Access Token
```bash
POST /api/auth/refresh
{
  "refreshToken": "your-refresh-token"
}
```

### 5. Enable 2FA
```bash
POST /api/twofactor/enable
Authorization: Bearer {access-token}
```

### 6. Verify 2FA Setup
```bash
POST /api/twofactor/verify
Authorization: Bearer {access-token}
{
  "code": "123456"
}
```

### 7. Login with 2FA
```bash
POST /api/auth/login-2fa
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "twoFactorCode": "123456"
}
```

### 8. Password Reset
```bash
POST /api/auth/forgot-password
{
  "email": "newuser@example.com"
}

POST /api/auth/reset-password
{
  "email": "newuser@example.com",
  "token": "{reset-token}",
  "newPassword": "NewPassword123!"
}
```

---

## Best Practices Summary

1. **Always use HTTPS** in production
2. **Store secrets securely** (Azure Key Vault, AWS Secrets Manager)
3. **Use short-lived access tokens** (15-30 minutes)
4. **Implement refresh token rotation** for better security
5. **Enable rate limiting** to prevent brute force attacks
6. **Log security events** (failed logins, password changes)
7. **Use secure email service** (SendGrid, AWS SES)
8. **Test 2FA thoroughly** before deploying
9. **Store recovery codes** securely
10. **Implement account lockout** after failed attempts
11. **Use strong password policies**
12. **Validate all inputs** to prevent injection attacks
13. **Implement CORS properly** for frontend apps
14. **Use claims for fine-grained authorization**
15. **Regularly update dependencies** for security patches

This advanced guide covers enterprise-level authentication and authorization features that you'll need for production applications!

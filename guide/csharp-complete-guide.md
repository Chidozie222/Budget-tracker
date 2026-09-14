# The Complete C# Guide (In-Depth Edition)

## 1. What C# Is and Where It's Used

C# is a statically-typed, object-oriented language built by Microsoft, running on the .NET platform. Code compiles to Intermediate Language (IL), which the .NET runtime (CLR) executes just-in-time — similar in spirit to Java/JVM.

**Where it's actually used (so the examples below land):**
- **Web APIs & backend services** — ASP.NET Core (most common professional use case)
- **Cloud/DevOps** — Azure Functions, containerized services, background workers
- **Desktop apps** — WPF, WinForms, .NET MAUI
- **Game development** — Unity uses C# as its scripting language
- **Enterprise systems** — banking, healthcare, large internal tools

Setup:
```bash
dotnet new console -n MyApp   # new console project
dotnet new webapi -n MyApi    # new web API project
cd MyApp
dotnet run
dotnet add package Newtonsoft.Json   # install a NuGet package
```

---

## 2. Basic Types — In Depth

```csharp
int age = 25;                // 32-bit integer, most common whole-number type
long bigNumber = 9000000000L; // 64-bit, use when int overflows (~2.1 billion max)
double price = 19.99;         // 64-bit floating point, general decimal math
float ratio = 0.5f;           // 32-bit floating point, less precision, less memory
decimal money = 19.99m;       // 128-bit, exact decimal representation
bool isActive = true;
char letter = 'A';
string name = "Chidozie";
var inferred = "compiler infers string here";
```

### Use case: why `decimal` for money, never `double`
```csharp
double a = 0.1 + 0.2;
Console.WriteLine(a); // 0.30000000000000004 — floating point rounding error

decimal b = 0.1m + 0.2m;
Console.WriteLine(b); // 0.3 — exact

// Real scenario: calculating an invoice total
decimal price = 19.99m;
decimal taxRate = 0.08m;
decimal total = price + (price * taxRate); // 21.5892 — precise to the cent
```
**Rule:** any time money is involved, use `decimal`. Using `double` for currency causes real, hard-to-trace rounding bugs in production financial calculations.

### Nullable value types — use case: optional database fields
```csharp
int? discountPercent = null; // a product might not have a discount

public class Order
{
    public int Id { get; set; }
    public DateTime? ShippedDate { get; set; } // null until the order ships
}

// Checking before use
if (order.ShippedDate.HasValue)
{
    Console.WriteLine($"Shipped on {order.ShippedDate.Value}");
}
else
{
    Console.WriteLine("Not yet shipped");
}
```

---

## 3. Classes — In Depth

Classes model real-world entities with state (fields/properties) and behavior (methods).

```csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Email { get; set; }
    public DateTime CreatedAt { get; init; }  // settable only during construction

    public User(int id, string name)
    {
        Id = id;
        Name = name;
        CreatedAt = DateTime.Now;
    }

    public string Greet() => $"Hello, {Name}";
}
```

### Use case: encapsulation with validated properties
A bank account should never allow a negative balance through direct assignment — encapsulate that rule inside the property setter or a method.

```csharp
public class BankAccount
{
    private decimal _balance;

    public decimal Balance
    {
        get => _balance;
        private set  // private setter — only this class can change balance directly
        {
            if (value < 0) throw new InvalidOperationException("Balance cannot be negative");
            _balance = value;
        }
    }

    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Deposit must be positive");
        Balance += amount;
    }

    public void Withdraw(decimal amount)
    {
        if (amount > Balance) throw new InvalidOperationException("Insufficient funds");
        Balance -= amount;
    }
}

var account = new BankAccount();
account.Deposit(100);
account.Withdraw(30);
Console.WriteLine(account.Balance); // 70
// account.Balance = -50;  // would not compile — setter is private
```

### Access Modifiers — full table with use cases

| Modifier | Meaning | Typical use case |
|---|---|---|
| `public` | accessible everywhere | API methods/properties consumers need |
| `private` | only within the same class | internal helper methods, backing fields |
| `protected` | class + subclasses | shared logic subclasses can reuse/override |
| `internal` | only within the same project/assembly | implementation details not meant for consumers of your library |
| `protected internal` | subclasses OR same assembly | rare — library internals extendable by subclasses |
| `private protected` | subclasses within same assembly only | tightest possible "shared with children" scope |

```csharp
// Real scenario: a library exposes a public API but hides internal helpers
public class PaymentProcessor
{
    public void ProcessPayment(decimal amount) // public — the API consumers call
    {
        ValidateAmount(amount);
        // ... process
    }

    private void ValidateAmount(decimal amount) // private — implementation detail
    {
        if (amount <= 0) throw new ArgumentException("Invalid amount");
    }
}
```

---

## 4. Inheritance and Polymorphism — In Depth

### Use case: a notification system with multiple delivery channels
```csharp
public abstract class Notification
{
    public string Message { get; set; }
    public abstract void Send();          // must be implemented by every subclass
    public virtual void Log() =>          // has a default, but CAN be overridden
        Console.WriteLine($"Sending: {Message}");
}

public class EmailNotification : Notification
{
    public string ToAddress { get; set; }
    public override void Send() => Console.WriteLine($"Emailing {ToAddress}: {Message}");
}

public class SmsNotification : Notification
{
    public string PhoneNumber { get; set; }
    public override void Send() => Console.WriteLine($"Texting {PhoneNumber}: {Message}");
    public override void Log() => Console.WriteLine($"[SMS LOG] {Message}"); // custom logging
}

// Polymorphism: treat all notification types uniformly
List<Notification> notifications = new()
{
    new EmailNotification { ToAddress = "a@b.com", Message = "Welcome!" },
    new SmsNotification { PhoneNumber = "555-1234", Message = "Your code is 1234" }
};

foreach (var n in notifications)
{
    n.Log();
    n.Send(); // calls the correct overridden version automatically
}
```
This is the core benefit of polymorphism: calling code doesn't need `if/else` chains checking notification type — each object knows how to handle itself.

### `sealed` — use case: preventing unsafe extension
```csharp
public sealed class SecurityToken
{
    public string Value { get; }
    public SecurityToken(string value) => Value = value;
}
// Prevents someone from subclassing and overriding security-critical behavior
```

---

## 5. Interfaces — In Depth

### Use case: dependency injection and testability
Interfaces let you swap implementations — critical for unit testing and for ASP.NET Core's dependency injection system.

```csharp
public interface IEmailService
{
    void SendEmail(string to, string subject, string body);
}

// Production implementation
public class SmtpEmailService : IEmailService
{
    public void SendEmail(string to, string subject, string body)
    {
        // actually connects to an SMTP server
        Console.WriteLine($"Sending real email to {to}");
    }
}

// Test/fake implementation — no real emails sent during tests
public class FakeEmailService : IEmailService
{
    public List<string> SentEmails { get; } = new();
    public void SendEmail(string to, string subject, string body)
    {
        SentEmails.Add(to); // just records it, useful for asserting in tests
    }
}

// A class depends on the interface, not a concrete implementation
public class UserRegistrationService
{
    private readonly IEmailService _emailService;
    public UserRegistrationService(IEmailService emailService) // injected
    {
        _emailService = emailService;
    }

    public void Register(string email)
    {
        // ... save user
        _emailService.SendEmail(email, "Welcome", "Thanks for signing up!");
    }
}

// In production: new UserRegistrationService(new SmtpEmailService());
// In tests:      new UserRegistrationService(new FakeEmailService());
```
This pattern — coding against an interface instead of a concrete class — is the backbone of testable, maintainable C# applications, and it's exactly what ASP.NET Core's built-in DI container is designed around.

### Multiple interface implementation — use case
```csharp
public interface ILoggable { void Log(); }
public interface ICacheable { string CacheKey(); }

public class Product : ILoggable, ICacheable
{
    public int Id { get; set; }
    public void Log() => Console.WriteLine($"Product {Id} accessed");
    public string CacheKey() => $"product:{Id}";
}
```

---

## 6. Structs vs Classes — In Depth

```csharp
public struct Point
{
    public int X { get; set; }
    public int Y { get; set; }
}
```

| | Class | Struct |
|---|---|---|
| Type | reference type (heap) | value type (usually stack) |
| Passed to methods | by reference | by value (copied) |
| Default | can be `null` | cannot be `null` (unless `Point?`) |
| Use for | most objects, entities with identity | small, immutable data bundles |

### Use case: why the choice matters
```csharp
// Struct — copied, changes don't affect original
public struct PointStruct { public int X; }
void ModifyStruct(PointStruct p) { p.X = 100; }

var s = new PointStruct { X = 1 };
ModifyStruct(s);
Console.WriteLine(s.X); // still 1 — copy was modified, not original

// Class — reference, changes DO affect original
public class PointClass { public int X; }
void ModifyClass(PointClass p) { p.X = 100; }

var c = new PointClass { X = 1 };
ModifyClass(c);
Console.WriteLine(c.X); // 100 — same object was modified
```
**Practical guidance:** use structs for things like `Point`, `Color`, `Money` (small, value-like, rarely mutated after creation). Use classes for almost everything else — entities, services, anything with identity or complex behavior.

---

## 7. Collections — In Depth with Use Cases

```csharp
// List<T> — use case: a shopping cart
List<string> cart = new List<string>();
cart.Add("Laptop");
cart.Add("Mouse");
cart.Remove("Mouse");
cart.Contains("Laptop"); // true
cart.Count;              // 1

// Dictionary<TKey,TValue> — use case: caching lookup results by key
Dictionary<string, User> userCache = new();
userCache["chidozie@example.com"] = new User(1, "Chidozie");
if (userCache.TryGetValue("chidozie@example.com", out User? user))
{
    Console.WriteLine(user.Name); // avoids exceptions from missing keys
}

// HashSet<T> — use case: tracking unique visitor IDs
HashSet<int> uniqueVisitors = new();
uniqueVisitors.Add(101);
uniqueVisitors.Add(101); // ignored — already present
Console.WriteLine(uniqueVisitors.Count); // 1

// Queue<T> — use case: processing tasks in the order they arrive (FIFO)
Queue<string> printJobs = new();
printJobs.Enqueue("Document1.pdf");
printJobs.Enqueue("Document2.pdf");
string nextJob = printJobs.Dequeue(); // "Document1.pdf" — first in, first out

// Stack<T> — use case: undo functionality (LIFO)
Stack<string> undoHistory = new();
undoHistory.Push("Typed 'Hello'");
undoHistory.Push("Typed 'World'");
string lastAction = undoHistory.Pop(); // "Typed 'World'" — most recent undone first
```

### Choosing the right collection
| Collection | Choose when |
|---|---|
| `List<T>` | Order matters, duplicates allowed, general-purpose |
| `Dictionary<K,V>` | Fast lookup by a unique key |
| `HashSet<T>` | Need uniqueness, order doesn't matter, fast lookups |
| `Queue<T>` | Process items in arrival order (FIFO) — task queues, message processing |
| `Stack<T>` | Most-recent-first processing (LIFO) — undo/redo, parsing, backtracking |

---

## 8. LINQ — In Depth with Use Cases

LINQ turns loop-heavy code into declarative, readable queries.

```csharp
public class Order
{
    public int Id { get; set; }
    public string CustomerName { get; set; }
    public decimal Total { get; set; }
    public bool IsPaid { get; set; }
    public DateTime Date { get; set; }
}

List<Order> orders = GetOrders();
```

### Use case: sales report — total revenue from paid orders this month
```csharp
decimal monthlyRevenue = orders
    .Where(o => o.IsPaid && o.Date.Month == DateTime.Now.Month)
    .Sum(o => o.Total);
```

### Use case: top 5 customers by spend
```csharp
var topCustomers = orders
    .GroupBy(o => o.CustomerName)
    .Select(g => new { Customer = g.Key, TotalSpent = g.Sum(o => o.Total) })
    .OrderByDescending(x => x.TotalSpent)
    .Take(5)
    .ToList();
```

### Use case: find the first unpaid order, or null if none
```csharp
Order? firstUnpaid = orders.FirstOrDefault(o => !o.IsPaid);
```

### Use case: check if ANY order is over $1000 (for a fraud alert)
```csharp
bool hasLargeOrder = orders.Any(o => o.Total > 1000);
```

### Use case: transform a list of orders into a list of receipt strings
```csharp
List<string> receipts = orders
    .Select(o => $"Order #{o.Id}: ${o.Total:F2}")
    .ToList();
```

### Deferred execution — an important gotcha
```csharp
var query = orders.Where(o => o.IsPaid); // NOT executed yet — just a plan
orders.Add(new Order { IsPaid = true });  // this new order WILL be included
var results = query.ToList();             // execution happens HERE

// Use .ToList() early if you want to "freeze" the results at a point in time
```

---

## 9. Exception Handling — In Depth

### Use case: robust file processing that won't crash the app
```csharp
public string ReadConfigFile(string path)
{
    try
    {
        return File.ReadAllText(path);
    }
    catch (FileNotFoundException)
    {
        Console.WriteLine("Config file missing, using defaults");
        return GetDefaultConfig();
    }
    catch (UnauthorizedAccessException ex)
    {
        Console.WriteLine($"Permission denied: {ex.Message}");
        throw; // re-throw — this one shouldn't be silently swallowed
    }
    finally
    {
        Console.WriteLine("Finished attempting to read config"); // always runs
    }
}
```

### Custom exceptions — use case: meaningful domain errors
```csharp
public class InsufficientFundsException : Exception
{
    public decimal Requested { get; }
    public decimal Available { get; }

    public InsufficientFundsException(decimal requested, decimal available)
        : base($"Tried to withdraw {requested:C} but only {available:C} available")
    {
        Requested = requested;
        Available = available;
    }
}

public void Withdraw(decimal amount, decimal balance)
{
    if (amount > balance)
        throw new InsufficientFundsException(amount, balance);
}

// Calling code can catch specifically and access the extra info
try
{
    Withdraw(500, 100);
}
catch (InsufficientFundsException ex)
{
    Console.WriteLine($"Short by {ex.Requested - ex.Available:C}");
}
```
**Best practice:** catch specific exception types, not generic `Exception`, so you don't accidentally swallow bugs you didn't anticipate.

---

## 10. Async/Await — In Depth

### Use case: calling a web API without blocking
```csharp
public async Task<WeatherData> GetWeatherAsync(string city)
{
    using HttpClient client = new HttpClient();
    string json = await client.GetStringAsync($"https://api.weather.com/{city}");
    return JsonSerializer.Deserialize<WeatherData>(json);
}

// Calling it inside an async method
var weather = await GetWeatherAsync("Lagos");
```

### Use case: running independent operations concurrently
```csharp
// Sequential — slow, waits for each one before starting the next
var weather1 = await GetWeatherAsync("Lagos");
var weather2 = await GetWeatherAsync("Nairobi");
// Total time ≈ time(1) + time(2)

// Concurrent — starts both immediately, waits for both to finish
Task<WeatherData> task1 = GetWeatherAsync("Lagos");
Task<WeatherData> task2 = GetWeatherAsync("Nairobi");
await Task.WhenAll(task1, task2);
var result1 = task1.Result;
var result2 = task2.Result;
// Total time ≈ max(time(1), time(2)) — much faster
```

### Use case: a background worker that processes a queue continuously (common in cloud/DevOps services)
```csharp
public async Task ProcessQueueAsync(CancellationToken cancellationToken)
{
    while (!cancellationToken.IsCancellationRequested)
    {
        var message = await _queue.DequeueAsync(cancellationToken);
        if (message != null)
        {
            await ProcessMessageAsync(message);
        }
        await Task.Delay(1000, cancellationToken); // poll every second
    }
}
```
**Common pitfall:** never mix `.Result` or `.Wait()` with `await` in the same call chain in an app with a UI or ASP.NET context — it can cause a deadlock. Use `await` consistently.

---

## 11. Generics — In Depth

### Use case: a generic repository pattern (extremely common in real apps)
```csharp
public interface IRepository<T> where T : class
{
    T? GetById(int id);
    List<T> GetAll();
    void Add(T item);
}

public class InMemoryRepository<T> : IRepository<T> where T : class
{
    private readonly List<T> _items = new();
    public T? GetById(int id) => _items.ElementAtOrDefault(id);
    public List<T> GetAll() => _items;
    public void Add(T item) => _items.Add(item);
}

// Reusable for ANY entity type
var userRepo = new InMemoryRepository<User>();
var productRepo = new InMemoryRepository<Product>();
```

### Use case: a generic method that works with any comparable type
```csharp
public T FindMax<T>(List<T> items) where T : IComparable<T>
{
    T max = items[0];
    foreach (var item in items)
    {
        if (item.CompareTo(max) > 0) max = item;
    }
    return max;
}

FindMax(new List<int> { 3, 7, 2 });          // 7
FindMax(new List<string> { "b", "z", "a" }); // "z"
```

---

## 12. Delegates, Events, and Lambdas — In Depth

### Use case: a plugin-style callback system
```csharp
public class OrderProcessor
{
    // Action<T> delegate lets callers plug in custom logic without modifying this class
    public void ProcessOrder(Order order, Action<Order> onSuccess, Action<string> onError)
    {
        try
        {
            // ... process the order
            onSuccess(order);
        }
        catch (Exception ex)
        {
            onError(ex.Message);
        }
    }
}

var processor = new OrderProcessor();
processor.ProcessOrder(
    order,
    onSuccess: o => Console.WriteLine($"Order {o.Id} processed!"),
    onError: msg => Console.WriteLine($"Failed: {msg}")
);
```

### Use case: events for a UI-style notification system (publish/subscribe)
```csharp
public class StockTicker
{
    public event Action<string, decimal>? PriceChanged;

    public void UpdatePrice(string symbol, decimal newPrice)
    {
        PriceChanged?.Invoke(symbol, newPrice); // notify all subscribers
    }
}

var ticker = new StockTicker();
ticker.PriceChanged += (symbol, price) => Console.WriteLine($"{symbol} is now {price:C}");
ticker.PriceChanged += (symbol, price) => { if (price > 100) Console.WriteLine("ALERT: High price!"); };

ticker.UpdatePrice("AAPL", 150m); // both subscribers fire
```
This publish/subscribe pattern is the foundation of GUI event handling (button clicks, etc.) and is also used in backend systems for decoupled notifications.

---

## 13. Nullable Reference Types — In Depth

### Use case: preventing the most common runtime crash — `NullReferenceException`
```csharp
public class UserService
{
    public User? FindUser(int id) // ? signals "might return null"
    {
        return _users.FirstOrDefault(u => u.Id == id); // returns null if not found
    }
}

var service = new UserService();
User? user = service.FindUser(999);

// Without a null check, this would risk a crash:
// Console.WriteLine(user.Name); // compiler WARNS: user might be null

// Safe patterns:
Console.WriteLine(user?.Name ?? "User not found");   // null-conditional + coalescing

if (user is not null)
{
    Console.WriteLine(user.Name); // compiler knows it's safe here
}
```
With `<Nullable>enable</Nullable>` in your `.csproj`, the compiler tracks nullability everywhere and warns you at compile time — catching an entire class of bugs before the code ever runs.

---

## 14. Pattern Matching — In Depth

### Use case: processing different shapes of API responses
```csharp
public string DescribeResponse(object response) => response switch
{
    int statusCode when statusCode >= 200 && statusCode < 300 => "Success",
    int statusCode when statusCode >= 400 && statusCode < 500 => "Client error",
    int statusCode when statusCode >= 500 => "Server error",
    string errorMessage => $"Error: {errorMessage}",
    null => "No response",
    _ => "Unknown response type"
};
```

### Use case: routing logic based on record shape
```csharp
public record Shape;
public record Circle(double Radius) : Shape;
public record Rectangle(double Width, double Height) : Shape;

public double CalculateArea(Shape shape) => shape switch
{
    Circle c => Math.PI * c.Radius * c.Radius,
    Rectangle r => r.Width * r.Height,
    _ => throw new ArgumentException("Unknown shape")
};
```

---

## 15. Records — In Depth

### Use case: immutable DTOs (Data Transfer Objects) for an API
```csharp
public record UserDto(int Id, string Name, string Email);

// Value equality — useful for comparing API responses in tests
var expected = new UserDto(1, "Chidozie", "c@example.com");
var actual = new UserDto(1, "Chidozie", "c@example.com");
Console.WriteLine(expected == actual); // true — compares values, not references

// "with" expressions — create a modified copy without mutating the original
var updated = expected with { Email = "new@example.com" };
// expected is untouched — updated is a new record
```
Records are ideal for API request/response models, event payloads, and configuration objects — anywhere you want "this data, exactly, and it shouldn't silently mutate."

---

## 16. Tuples — In Depth

### Use case: returning multiple related values without creating a whole class
```csharp
public (bool Success, string? ErrorMessage) ValidateInput(string input)
{
    if (string.IsNullOrEmpty(input))
        return (false, "Input cannot be empty");
    if (input.Length > 100)
        return (false, "Input too long");
    return (true, null);
}

var (isValid, error) = ValidateInput(userInput);
if (!isValid)
{
    Console.WriteLine($"Validation failed: {error}");
}
```
Tuples are great for quick, internal multi-return-value cases; for anything public-facing or reused across a codebase, prefer a named record instead for clarity.

---

## 17. Extension Methods — In Depth

### Use case: adding domain-specific helpers to built-in types
```csharp
public static class StringExtensions
{
    public static bool IsValidEmail(this string str) =>
        !string.IsNullOrWhiteSpace(str) && str.Contains("@") && str.Contains(".");

    public static string Truncate(this string str, int maxLength) =>
        str.Length <= maxLength ? str : str[..maxLength] + "...";
}

// Usage reads naturally, as if it were built into the string type
"chidozie@example.com".IsValidEmail(); // true
"A very long blog post title here".Truncate(10); // "A very lo..."
```
Extension methods are how LINQ itself is implemented (`.Where()`, `.Select()`, etc. are extension methods on `IEnumerable<T>`) — understanding them helps demystify how LINQ "attaches" to any collection type.

---

## 18. Namespaces and Project Structure — In Depth

```csharp
// File-scoped namespace (modern C# 10+ style, less indentation)
namespace MyApp.Services;

public class OrderService { }
```

### Use case: organizing a real project
```
MyApp/
├── Models/       (namespace MyApp.Models)      — data classes: User, Order, Product
├── Services/     (namespace MyApp.Services)     — business logic: OrderService, EmailService
├── Repositories/ (namespace MyApp.Repositories)  — data access: UserRepository
├── Controllers/  (namespace MyApp.Controllers)   — API endpoints (ASP.NET Core)
└── Program.cs    — application entry point / DI setup
```
```csharp
using MyApp.Models;
using MyApp.Services;

var orderService = new OrderService();
```

---

## 19. String Formatting — In Depth

### Use case: generating a formatted invoice line
```csharp
string item = "Laptop";
decimal price = 999.999m;
int quantity = 2;

string line = $"{item,-15}{quantity,5}{price,10:C}";
// "Laptop            2   $1,000.00" — left-align item, right-align qty/price

// Common format specifiers
$"{price:C}";      // Currency: $999.99
$"{0.4567:P}";     // Percentage: 45.67%
$"{1234567:N0}";   // Number with separators: 1,234,567
$"{DateTime.Now:yyyy-MM-dd}"; // Date: 2026-09-12
$"{42:D5}";        // Zero-padded: 00042
```

---

## 20. Common Patterns and Best Practices — Expanded

- **Use `var` when the type is obvious**, explicit types when clarity needs it (e.g., `int total = 0;` vs. a long LINQ chain result).
- **Prefer LINQ over manual loops** for readability, but drop to a `foreach` loop when performance-critical or when the LINQ chain becomes hard to read.
- **Enable nullable reference types** project-wide — it catches an entire category of runtime crashes at compile time.
- **Never mix blocking calls with async** (`.Result`/`.Wait()` + `await` in the same flow) — deadlock risk in ASP.NET/UI contexts.
- **Favor composition and interfaces over deep inheritance chains** — easier to test, easier to change later.
- **Use records for immutable data**, classes for objects with behavior and identity.
- **Catch specific exceptions**, not bare `Exception`, so real bugs surface instead of being silently swallowed.
- **Use dependency injection** (built into ASP.NET Core's `IServiceCollection`) instead of manually constructing dependencies — makes testing and swapping implementations painless.

```csharp
// Dependency injection setup example (ASP.NET Core Program.cs)
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();
```

---

## 21. Quick Reference Cheat Sheet

```csharp
int, long, double, decimal, bool, char, string, DateTime, object
T?                                       // nullable
List<T>, Dictionary<K,V>, HashSet<T>, Queue<T>, Stack<T>
class / struct / interface / record / enum
public / private / protected / internal / protected internal / private protected
virtual / override / abstract / sealed
Func<T,TResult> / Action<T> / Predicate<T>
async Task<T> / await / Task.WhenAll(...)
=> expr                                  // lambda / expression-bodied member
?. / ?? / ??=                            // null-conditional, null-coalescing
var x = ...                              // type inferred
x switch { pattern when cond => result, _ => default }
list.Where(...).Select(...).OrderBy(...).GroupBy(...).ToList()
record Foo(int A, string B);             // immutable data type
(bool, string) Method() => (true, "ok"); // tuple return
this.Extend()                            // extension method pattern
```

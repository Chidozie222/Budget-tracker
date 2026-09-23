# NestJS In-Depth Guide

A complete walkthrough from fundamentals to production-leaning patterns, using a `Cats` + `Owners` domain as the running example.

---

## 1. What NestJS Is and Why It Exists

NestJS is a Node.js framework (built on top of Express by default, or optionally Fastify) that adds architecture on top of what Express leaves totally open. Express gives you routing and middleware and nothing else — you decide how to organize everything. Nest gives you an opinionated structure borrowed heavily from Angular: modules, dependency injection, decorators, and a clear separation of concerns.

**When Nest earns its complexity:**
- Multiple developers working on the same codebase
- Long-lived apps that will be extended for years
- Apps that need testability baked in from day one
- Teams that want enforced consistency across features

**When plain Express is enough:**
- Small APIs, prototypes, single-file scripts
- Serverless functions where cold-start size matters
- You want full control with minimal abstraction

Nest doesn't replace Express — it sits on top of it. You can still access the underlying Express `req`/`res` objects when needed.

---

## 2. Core Building Blocks

| Concept | Decorator | Purpose |
|---|---|---|
| Module | `@Module()` | Groups related code into a cohesive unit |
| Controller | `@Controller()` | Handles HTTP requests, defines routes |
| Provider/Service | `@Injectable()` | Holds business logic, injected wherever needed |
| Entity | `@Entity()` (TypeORM) | Maps a class to a database table |
| DTO | (plain class + `class-validator`) | Defines and validates shape of incoming data |
| Pipe | `@UsePipes()` | Transforms/validates input before it hits a handler |
| Guard | `@UseGuards()` | Decides whether a request is allowed through (auth) |
| Interceptor | `@UseInterceptors()` | Wraps request/response handling (logging, caching, shaping output) |
| Middleware | (Express-style function) | Runs before routing, similar to raw Express middleware |

The request lifecycle, roughly in order:
```
Middleware → Guards → Interceptors (pre) → Pipes → Route Handler → Interceptors (post) → Exception Filters
```

---

## 3. Project Setup

```bash
npm i -g @nestjs/cli
nest new my-app
cd my-app
npm run start:dev
```

Generating pieces with the CLI keeps naming and folder structure consistent:
```bash
nest generate module cats
nest generate controller cats
nest generate service cats
```

---

## 4. Dependency Injection — The Biggest Mental Shift

In Express, if a route handler needs a service, you usually import it directly or pass it around manually. In Nest, you never write `new CatsService()`. Instead:

```typescript
@Injectable()
export class CatsService { /* ... */ }

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}
}
```

Nest's IoC (Inversion of Control) container:
1. Sees `CatsController` needs a `CatsService` in its constructor
2. Creates (or reuses) a single instance of `CatsService`
3. Injects it automatically at startup

**Why this matters:** you can swap `CatsService` for a mock in tests without touching the controller at all. It also means the container manages lifecycle — normally providers are singletons shared across the whole app.

---

## 5. Modules — Organizing the App

Every Nest app has a root `AppModule` that imports feature modules.

```typescript
// cats.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Cat, Owner])],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService], // makes CatsService available to other modules that import CatsModule
})
export class CatsModule {}
```

- `imports`: other modules this one depends on
- `controllers`: route handlers belonging to this module
- `providers`: services registered in this module's scope
- `exports`: which providers other modules can use if they import this module

Rule of thumb: one module per feature/domain (Cats, Owners, Auth, Users...).

---

## 6. Controllers and Routing

```typescript
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Get()
  findAll() {
    return this.catsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catsService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateCatDto) {
    return this.catsService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catsService.remove(+id);
  }
}
```

Useful parameter decorators:
- `@Param('id')` — route params
- `@Query('sort')` — query string params
- `@Body()` — request body
- `@Headers('authorization')` — request headers
- `@Req()` / `@Res()` — raw Express request/response, if you need to drop down a level

---

## 7. DTOs and Validation

DTOs define the *shape of incoming data* and, paired with `class-validator`, enforce rules automatically.

```bash
npm i class-validator class-transformer
```

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe());
```

```typescript
// create-cat.dto.ts
export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  age: number;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsInt()
  ownerId: number;
}
```

With `ValidationPipe` registered globally, any request that fails these rules is rejected with a 400 automatically — no manual `if` checks in your handlers.

**DTO vs Entity — don't confuse them:**
- **DTO** = shape of data coming in/out over the network
- **Entity** = shape of data as stored in the database

They often look similar early on but diverge as the app grows (e.g., a DTO might omit `id`, or an entity might have fields you never expose in an API response).

---

## 8. Database Integration with TypeORM

```bash
npm i @nestjs/typeorm typeorm sqlite3
```

```typescript
// app.module.ts
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: 'db.sqlite',
  autoLoadEntities: true,
  synchronize: true, // dev only
})
```

`synchronize: true` auto-creates/alters tables from your entities — convenient for learning, dangerous in production (can drop columns unexpectedly). Real apps use migrations instead.

**Entity:**
```typescript
@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column({ nullable: true })
  breed?: string;

  @ManyToOne(() => Owner, (owner) => owner.cats)
  owner: Owner;
}
```

**Repository pattern in the service:**
```typescript
@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat) private catsRepository: Repository<Cat>,
  ) {}

  create(dto: CreateCatDto) {
    const cat = this.catsRepository.create(dto);
    return this.catsRepository.save(cat);
  }

  findAll() {
    return this.catsRepository.find();
  }
}
```

`Repository<Cat>` gives you `find`, `findOneBy`, `save`, `delete`, `update`, and more — no raw SQL needed for common cases.

---

## 9. Relations

**One-to-Many / Many-to-One** (an Owner has many Cats):
```typescript
// owner.entity.ts
@OneToMany(() => Cat, (cat) => cat.owner)
cats: Cat[];

// cat.entity.ts
@ManyToOne(() => Owner, (owner) => owner.cats)
owner: Owner;
```

**Fetching related data** — TypeORM does *not* auto-join. You must ask for it:
```typescript
findAll() {
  return this.catsRepository.find({ relations: ['owner'] });
}
```

**Other relation types:**
- `@ManyToMany` — e.g., Cats ↔ Toys (a join table is auto-created)
- `@OneToOne` — strict 1:1, e.g., User ↔ Profile

**Linking on create:**
```typescript
async create(dto: CreateCatDto) {
  const owner = await this.ownersRepository.findOneBy({ id: dto.ownerId });
  if (!owner) throw new NotFoundException('Owner not found');
  const cat = this.catsRepository.create({ ...dto, owner });
  return this.catsRepository.save(cat);
}
```

---

## 10. Guards — Authentication & Authorization

Guards decide whether a request is allowed to proceed, based on request context (usually a header/token).

```bash
npm i @nestjs/passport passport passport-jwt @nestjs/jwt
```

**A simple custom guard:**
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];
    return !!token; // replace with real verification
  }
}
```

**Applying it:**
```typescript
@UseGuards(AuthGuard)
@Get()
findAll() {
  return this.catsService.findAll();
}
```

Guards can be applied per-route, per-controller (`@UseGuards(AuthGuard)` above the class), or globally (`app.useGlobalGuards()`).

**Real JWT auth** typically uses `@nestjs/passport` with a `JwtStrategy` — Nest's docs have a full recipe, but the shape is: a `LocalStrategy` validates login credentials and issues a JWT, then a `JwtStrategy` + `AuthGuard('jwt')` protects routes afterward.

---

## 11. Pipes — Beyond Validation

Pipes transform or validate arguments before they reach a handler. `ValidationPipe` is the most common, but you can write custom ones:

```typescript
@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: string): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) throw new BadRequestException('Not a valid number');
    return val;
  }
}
```

```typescript
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}
```

(Nest ships a built-in `ParseIntPipe` — this is just illustrating the pattern.)

---

## 12. Interceptors — Wrapping Behavior

Interceptors can run logic before *and* after a handler executes — useful for logging, response shaping, or caching.

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => console.log(`Request took ${Date.now() - start}ms`)),
    );
  }
}
```

Apply with `@UseInterceptors(LoggingInterceptor)` on a controller or globally.

---

## 13. Exception Filters — Consistent Error Responses

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
    });
  }
}
```

This lets you standardize error response shape across the whole API rather than each handler formatting errors differently.

---

## 14. Testing

Nest is built with testing in mind — DI makes mocking trivial.

```typescript
describe('CatsService', () => {
  let service: CatsService;
  let mockRepo: Partial<Repository<Cat>>;

  beforeEach(async () => {
    mockRepo = {
      find: jest.fn().mockResolvedValue([]),
      save: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        CatsService,
        { provide: getRepositoryToken(Cat), useValue: mockRepo },
      ],
    }).compile();

    service = module.get(CatsService);
  });

  it('returns an empty array initially', async () => {
    expect(await service.findAll()).toEqual([]);
  });
});
```

`Test.createTestingModule` builds a mini DI container just for the test, letting you swap real dependencies (like the database repository) for mocks.

---

## 15. Microservices & Beyond

Once comfortable with the HTTP layer, Nest also supports:
- **Microservices** (`@nestjs/microservices`) — TCP, Redis, RabbitMQ, Kafka transports
- **GraphQL** (`@nestjs/graphql`) — code-first or schema-first APIs
- **WebSockets** (`@nestjs/websockets`) — real-time gateways with `@WebSocketGateway()`
- **Task scheduling** (`@nestjs/schedule`) — cron-like jobs
- **Configuration management** (`@nestjs/config`) — typed, validated env vars

---

## 16. Suggested Practice Path

1. Rebuild the Cats + Owners API by hand, entity by entity, without copy-pasting.
2. Add a `Toys` entity with a `@ManyToMany` relation to Cats.
3. Add JWT auth: protect `POST`/`DELETE` routes, leave `GET` public.
4. Write unit tests for `CatsService` using mocked repositories.
5. Swap SQLite for Postgres and add a real migration instead of `synchronize: true`.
6. Add a global exception filter and a logging interceptor.

---

## Quick Reference — Decorator Cheat Sheet

```
@Module()        — groups controllers + providers
@Controller()    — defines a route prefix + handlers
@Injectable()    — marks a class as a provider (DI-eligible)
@Get() @Post()   — HTTP method + route
@Param() @Query() @Body() — extract request data
@Entity()        — TypeORM: maps class to DB table
@Column()        — TypeORM: maps property to DB column
@OneToMany() @ManyToOne() @ManyToMany() @OneToOne() — relations
@UseGuards()     — attach auth/authorization checks
@UsePipes()      — attach validation/transformation
@UseInterceptors() — attach cross-cutting request/response logic
@Catch()         — define an exception filter's scope
```

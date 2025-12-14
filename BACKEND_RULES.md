# BACKEND DEVELOPMENT RULES - Inderbu Scenarios Backend

## 📋 TABLE OF CONTENTS
1. [General Architecture](#general-architecture)
2. [Folder Structure](#folder-structure)
3. [Domain Entities](#domain-entities)
4. [Persistence Entities](#persistence-entities)
5. [Mappers](#mappers)
6. [Repository Ports](#repository-ports)
7. [Repository Adapters](#repository-adapters)
8. [Domain Services](#domain-services)
9. [Application Ports](#application-ports)
10. [Application Services](#application-services)
11. [DTOs](#dtos)
12. [Controllers](#controllers)
13. [Providers and Dependency Injection](#providers-and-dependency-injection)
14. [Tokens](#tokens)
15. [NestJS Modules](#nestjs-modules)
16. [Migrations](#migrations)
17. [Naming Conventions](#naming-conventions)
18. [Validations](#validations)
19. [Error Handling](#error-handling)
20. [Testing](#testing)

---

## 🏗️ GENERAL ARCHITECTURE

### Fundamental Principles

**HEXAGONAL ARCHITECTURE (Ports & Adapters)**
- **Core Domain** (`src/core/domain/`): Pure business logic, no external dependencies
- **Application Layer** (`src/core/application/`): Use cases and orchestration
- **Infrastructure Layer** (`src/infrastructure/`): Concrete implementations (DB, HTTP, etc.)

### MANDATORY RULES

1. **NEVER use `@nestjs/typeorm` decorators directly in services**
   - ❌ NO: `@InjectRepository(Entity)` in services
   - ✅ YES: Manual injection via providers and tokens

2. **Strict layer separation**
   - Domain does NOT know about Infrastructure
   - Application knows Domain but NOT Infrastructure directly
   - Infrastructure implements interfaces defined in Domain

3. **Dependency Inversion Principle (DIP)**
   - All dependencies injected via interfaces (Ports)
   - Never direct dependencies on concrete implementations

4. **Repository Pattern**
   - All data access goes through Repository Ports (interfaces)
   - Repository Adapters implement these interfaces using TypeORM
   - Services NEVER directly use TypeORM repositories

---

## 📁 FOLDER STRUCTURE

```
src/
├── core/
│   ├── domain/
│   │   ├── entities/           # Domain entities with Builder pattern
│   │   ├── services/           # Domain services (business logic)
│   │   └── ports/
│   │       └── outbound/       # Repository interfaces (output ports)
│   └── application/
│       ├── ports/
│       │   └── inbound/        # Use case interfaces (input ports)
│       ├── services/            # Application services (orchestration)
│       └── tokens/              # Tokens for DI of application ports
│
└── infrastructure/
    ├── adapters/
    │   ├── inbound/
    │   │   └── http/
    │   │       ├── controllers/    # HTTP controllers
    │   │       └── dtos/           # Request/response DTOs
    │   └── outbound/
    │       └── repositories/      # Repository implementations
    ├── mappers/                   # Mappers Domain ↔ Persistence
    ├── modules/                   # NestJS modules
    ├── persistence/               # TypeORM entities
    ├── providers/                 # DI providers
    ├── tokens/                    # DI tokens
    └── migrations/                # Database migrations
```

---

## 🎯 DOMAIN ENTITIES

### Location
`src/core/domain/entities/{entity-name}.domain-entity.ts`

### Mandatory Pattern: Builder Pattern

**ALL domain entities MUST use the Builder pattern for construction.**

### Structure Template

```typescript
import { Expose } from 'class-transformer';

export class EntityNameDomainEntity {
  @Expose()
  public readonly id: number | null;

  @Expose()
  public readonly fieldName: Type;

  // Private constructor - ONLY accessible via Builder
  private constructor(builder: EntityNameDomainBuilder) {
    this.id = builder.id;
    this.fieldName = builder.fieldName;
  }

  // Static factory method
  static buildFromBuilder(builder: EntityNameDomainBuilder): EntityNameDomainEntity {
    return new EntityNameDomainEntity(builder);
  }

  // Builder entry point
  static builder(): EntityNameDomainBuilder {
    return new EntityNameDomainBuilder();
  }

  // Business logic methods
  validateBusinessRule(): boolean {
    // Domain validation logic
  }
}

export class EntityNameDomainBuilder {
  id: number | null = null;
  fieldName: Type = defaultValue;

  withId(id: number | null): EntityNameDomainBuilder {
    this.id = id;
    return this;
  }

  withFieldName(fieldName: Type): EntityNameDomainBuilder {
    this.fieldName = fieldName;
    return this;
  }

  build(): EntityNameDomainEntity {
    return EntityNameDomainEntity.buildFromBuilder(this);
  }
}
```

### Rules

1. **All properties MUST be `readonly`**
2. **Constructor MUST be `private`**
3. **Use `@Expose()` from `class-transformer` for serialization**
4. **Builder methods MUST return `this` for chaining**
5. **Business logic methods go in the entity class, NOT the builder**
6. **Builder MUST have default values for all properties**

### Example

```typescript
// ✅ CORRECT
const entity = SubScenarioPriceDomainEntity.builder()
  .withId(1)
  .withFkSubScenarioId(5)
  .withHourlyPrice(150.00)
  .build();

// ❌ WRONG - Direct instantiation
const entity = new SubScenarioPriceDomainEntity(...);
```

---

## 💾 PERSISTENCE ENTITIES

### Location
`src/infrastructure/persistence/{entity-name}.entity.ts`

### Structure Template

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RelatedEntity } from './related-entity.entity';

@Entity('table_name')
export class EntityNameEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fk_related_id' })
  fkRelatedId: number;

  @Column({
    name: 'field_name',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'Field description'
  })
  fieldName: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
  })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => RelatedEntity)
  @JoinColumn({ name: 'fk_related_id' })
  relatedEntity: RelatedEntity;
}
```

### Rules

1. **Table names MUST be in snake_case**
2. **Column names MUST match database column names exactly (snake_case)**
3. **Property names in TypeScript use camelCase**
4. **ALWAYS use `@JoinColumn` for foreign keys**
5. **Include `created_at` and `updated_at` timestamps**
6. **Use appropriate TypeORM column types matching MySQL types**
7. **Add comments for complex fields**
8. **Relations are optional - only include if needed in queries**

### Database Schema Rules

- **Schema name**: `inderbu`
- **Table names**: snake_case, plural
- **Column names**: snake_case
- **Foreign keys**: `fk_{referenced_table}_{column}` (e.g., `fk_sub_scenario_id`)
- **Indexes**: `idx_{table}_{column}` or `idx_{table}_{columns}`
- **Unique keys**: `uk_{table}_{column}`

---

## 🔄 MAPPERS

### Location
`src/infrastructure/mappers/{entity-name}/{entity-name}-entity.mapper.ts`

### Structure Template

```typescript
import { DomainEntity } from '../../../core/domain/entities/domain-entity.domain-entity';
import { PersistenceEntity } from '../../persistence/persistence-entity.entity';

export class EntityNameEntityMapper {
  /**
   * Converts persistence entity to domain entity using Builder
   */
  static toDomain(entity: PersistenceEntity): DomainEntity {
    return DomainEntity.builder()
      .withId(entity.id)
      .withFieldName(entity.fieldName)
      .withCreatedAt(entity.createdAt)
      .withUpdatedAt(entity.updatedAt)
      .build();
  }

  /**
   * Converts domain entity to persistence entity
   */
  static toEntity(domain: DomainEntity): PersistenceEntity {
    const entity = new PersistenceEntity();
    if (domain.id !== null) {
      entity.id = domain.id;
    }
    entity.fieldName = domain.fieldName;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  /**
   * Converts array of persistence entities to domain entities
   */
  static toDomainArray(entities: PersistenceEntity[]): DomainEntity[] {
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * Converts array of domain entities to persistence entities
   */
  static toEntityArray(domains: DomainEntity[]): PersistenceEntity[] {
    return domains.map(domain => this.toEntity(domain));
  }
}
```

### Rules

1. **MUST be a static class (no instantiation)**
2. **MUST use Builder pattern in `toDomain()`**
3. **MUST handle `null` IDs correctly**
4. **MUST provide array conversion methods**
5. **Type conversions (e.g., Decimal to number) MUST happen here**
6. **MUST be pure functions (no side effects)**

### Example

```typescript
// ✅ CORRECT
const domain = SubScenarioPriceEntityMapper.toDomain(entity);
const entity = SubScenarioPriceEntityMapper.toEntity(domain);

// ❌ WRONG - Instance methods
const mapper = new SubScenarioPriceEntityMapper();
```

---

## 🔌 REPOSITORY PORTS

### Location
`src/core/domain/ports/outbound/{entity-name}-repository.port.ts`

### Structure Template

```typescript
import { DomainEntity } from '../../entities/domain-entity.domain-entity';

export interface IEntityNameRepositoryPort {
  /**
   * Finds entity by ID
   */
  findById(id: number): Promise<DomainEntity | null>;

  /**
   * Finds all entities with pagination
   */
  findPaged(page: number, limit: number): Promise<{ data: DomainEntity[]; total: number }>;

  /**
   * Saves entity (create or update)
   */
  save(entity: DomainEntity): Promise<DomainEntity>;

  /**
   * Deletes entity by ID
   */
  deleteById(id: number): Promise<boolean>;
}
```

### Rules

1. **MUST be an interface (not a class)**
2. **MUST be in Domain layer (core/domain)**
3. **MUST use Domain entities, NOT persistence entities**
4. **MUST return Promises**
5. **MUST have JSDoc comments for all methods**
6. **Method names MUST be descriptive and follow conventions:**
   - `findBy{Field}` - Find by specific field
   - `find{Entity}By{Field}` - Find related entity
   - `findPaged` - Paginated list
   - `save` - Create or update
   - `delete{By}` - Delete operations
   - `has{Field}` - Boolean checks
   - `count{By}` - Count operations

### Naming Convention

- Interface name: `I{EntityName}RepositoryPort`
- File name: `{entity-name}-repository.port.ts`

---

## 🔧 REPOSITORY ADAPTERS

### Location
`src/infrastructure/adapters/outbound/repositories/{entity-name}-repository.adapter.ts`

### Structure Template

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { IEntityNameRepositoryPort } from '../../../../core/domain/ports/outbound/entity-name-repository.port';
import { DomainEntity } from '../../../../core/domain/entities/domain-entity.domain-entity';
import { PersistenceEntity } from '../../../persistence/persistence-entity.entity';
import { EntityNameEntityMapper } from '../../../mappers/entity-name/entity-name-entity.mapper';
import { MYSQL_REPOSITORY } from '../../../tokens/repositories';

@Injectable()
export class EntityNameRepositoryAdapter implements IEntityNameRepositoryPort {
  constructor(
    @Inject(MYSQL_REPOSITORY.ENTITY_NAME)
    private readonly repository: Repository<PersistenceEntity>,
  ) {}

  async findById(id: number): Promise<DomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    return entity ? EntityNameEntityMapper.toDomain(entity) : null;
  }

  async findPaged(page: number, limit: number): Promise<{ data: DomainEntity[]; total: number }> {
    const [entities, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: EntityNameEntityMapper.toDomainArray(entities),
      total,
    };
  }

  async save(domain: DomainEntity): Promise<DomainEntity> {
    const entity = EntityNameEntityMapper.toEntity(domain);
    const savedEntity = await this.repository.save(entity);
    return EntityNameEntityMapper.toDomain(savedEntity);
  }

  async deleteById(id: number): Promise<boolean> {
    const result = await this.repository.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
```

### Rules

1. **MUST implement the Repository Port interface**
2. **MUST be `@Injectable()`**
3. **MUST inject TypeORM Repository via `@Inject(MYSQL_REPOSITORY.{ENTITY})`**
4. **MUST use Mapper for all conversions**
5. **MUST return Domain entities, NEVER persistence entities**
6. **MUST handle null/undefined cases**
7. **MUST use TypeORM QueryBuilder or repository methods (NOT raw SQL)**
8. **Pagination MUST use `skip` and `take`**

### TypeORM Repository Injection

```typescript
// ✅ CORRECT
@Inject(MYSQL_REPOSITORY.ENTITY_NAME)
private readonly repository: Repository<PersistenceEntity>

// ❌ WRONG - Direct injection
@InjectRepository(PersistenceEntity)
private readonly repository: Repository<PersistenceEntity>
```

---

## 🧠 DOMAIN SERVICES

### Location
`src/core/domain/services/{service-name}.domain-service.ts`

### Purpose
Pure business logic that doesn't belong to a single entity.

### Structure Template

```typescript
import { Injectable } from '@nestjs/common';
import { DomainEntity } from '../entities/domain-entity.domain-entity';

@Injectable()
export class ServiceNameDomainService {
  /**
   * Validates business rule
   */
  validateBusinessRule(entity: DomainEntity): { isValid: boolean; reason?: string } {
    // Pure business logic
    if (!entity.someField) {
      return { isValid: false, reason: 'Field is required' };
    }
    return { isValid: true };
  }

  /**
   * Calculates business value
   */
  calculateBusinessValue(entity: DomainEntity, params: any): number {
    // Pure calculation logic
    return entity.field * params.multiplier;
  }
}
```

### Rules

1. **MUST be `@Injectable()`**
2. **MUST contain ONLY business logic (no data access)**
3. **MUST be pure functions when possible**
4. **MUST NOT depend on Infrastructure layer**
5. **MUST NOT use TypeORM or any external libraries**
6. **MUST return structured results (objects, not just booleans)**

---

## 📥 APPLICATION PORTS

### Location
`src/core/application/ports/inbound/{feature-name}-application.port.ts`

### Structure Template

```typescript
export interface CreateEntityCommand {
  fieldName: string;
  // ... other fields
}

export interface UpdateEntityCommand {
  fieldName?: string;
  // ... other optional fields
}

export interface IFeatureNameApplicationPort {
  /**
   * Creates a new entity
   */
  createEntity(command: CreateEntityCommand): Promise<DomainEntity>;

  /**
   * Updates an existing entity
   */
  updateEntity(id: number, command: UpdateEntityCommand): Promise<DomainEntity>;

  /**
   * Gets entity by ID
   */
  getEntityById(id: number): Promise<DomainEntity | null>;

  /**
   * Gets all entities with pagination
   */
  getAllEntities(page?: number, limit?: number): Promise<{ data: DomainEntity[]; total: number }>;
}
```

### Rules

1. **MUST be an interface (not a class)**
2. **MUST define Command interfaces for operations**
3. **MUST use Domain entities in return types**
4. **MUST have JSDoc comments**
5. **Command interfaces MUST be exported**
6. **Method names MUST be descriptive verbs:**
   - `create{Entity}` - Create operations
   - `update{Entity}` - Update operations
   - `delete{Entity}` - Delete operations
   - `get{Entity}ById` - Get by ID
   - `getAll{Entities}` - List all
   - `validate{Entity}` - Validation operations

---

## ⚙️ APPLICATION SERVICES

### Location
`src/core/application/services/{feature-name}-application.service.ts`

### Structure Template

```typescript
import { Injectable, Inject } from '@nestjs/common';
import {
  IFeatureNameApplicationPort,
  CreateEntityCommand,
  UpdateEntityCommand,
} from '../ports/inbound/feature-name-application.port';
import { IEntityNameRepositoryPort } from '../../domain/ports/outbound/entity-name-repository.port';
import { DomainEntity } from '../../domain/entities/domain-entity.domain-entity';
import { DomainService } from '../../domain/services/domain-service.domain-service';
import { REPOSITORY_PORTS } from '../../../infrastructure/tokens/ports';

@Injectable()
export class FeatureNameApplicationService implements IFeatureNameApplicationPort {
  constructor(
    @Inject(REPOSITORY_PORTS.ENTITY_NAME)
    private readonly repository: IEntityNameRepositoryPort,
    private readonly domainService: DomainService,
  ) {}

  async createEntity(command: CreateEntityCommand): Promise<DomainEntity> {
    // 1. Validate business rules
    const validation = this.domainService.validateBusinessRule(command);
    if (!validation.isValid) {
      throw new Error(validation.reason);
    }

    // 2. Check if entity already exists
    const existing = await this.repository.findByField(command.fieldName);
    if (existing) {
      throw new Error('Entity already exists');
    }

    // 3. Create domain entity using Builder
    const entity = DomainEntity.builder()
      .withFieldName(command.fieldName)
      .build();

    // 4. Save via repository
    return await this.repository.save(entity);
  }

  async updateEntity(id: number, command: UpdateEntityCommand): Promise<DomainEntity> {
    // 1. Find existing entity
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Entity not found');
    }

    // 2. Validate business rules
    // ...

    // 3. Update and save
    const updated = DomainEntity.builder()
      .withId(existing.id)
      .withFieldName(command.fieldName ?? existing.fieldName)
      .build();

    return await this.repository.save(updated);
  }

  async getEntityById(id: number): Promise<DomainEntity | null> {
    return await this.repository.findById(id);
  }

  async getAllEntities(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: DomainEntity[]; total: number }> {
    return await this.repository.findPaged(page, limit);
  }
}
```

### Rules

1. **MUST implement the Application Port interface**
2. **MUST be `@Injectable()`**
3. **MUST inject Repository Ports (interfaces), NOT adapters**
4. **MUST use Domain Services for business logic**
5. **MUST use Builder pattern to create Domain entities**
6. **MUST throw Errors (not HTTP exceptions) - let Controllers handle HTTP**
7. **MUST validate before operations**
8. **MUST handle null/undefined cases**
9. **MUST orchestrate between repositories and domain services**

### Error Handling

```typescript
// ✅ CORRECT - Throw Error with message
if (!entity) {
  throw new Error('Entity not found');
}

// ❌ WRONG - HTTP exceptions in service
if (!entity) {
  throw new NotFoundException('Entity not found');
}
```

---

## 📦 DTOs

### Location
`src/infrastructure/adapters/inbound/http/dtos/{feature-name}/{dto-name}.dto.ts`

### Request DTO Template

```typescript
import { IsString, IsNumber, IsEmail, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEntityDto {
  @ApiProperty({
    description: 'Field description',
    example: 'example value',
    minimum: 1,
  })
  @IsNumber({}, { message: 'Field must be a number' })
  @Min(1, { message: 'Field must be greater than 0' })
  fieldName: number;

  @ApiPropertyOptional({
    description: 'Optional field',
    example: 'optional value',
  })
  @IsOptional()
  @IsString({ message: 'Field must be a string' })
  optionalField?: string;
}
```

### Response DTO Template

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class EntityResponseDto {
  @ApiProperty({
    description: 'Entity ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Field description',
    example: 'value',
  })
  fieldName: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-12-12T06:45:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-12-12T06:45:00.000Z',
  })
  updatedAt: Date;
}
```

### Rules

1. **MUST use `class-validator` decorators for validation**
2. **MUST use `@nestjs/swagger` decorators for API documentation**
3. **MUST have descriptive error messages**
4. **MUST include examples in `@ApiProperty`**
5. **Request DTOs: Use `IsOptional()` for optional fields**
6. **Response DTOs: Include all fields that will be returned**
7. **File naming: `{action}-{entity}.dto.ts` (e.g., `create-sub-scenario-price.dto.ts`)**

### Validation Rules

- Use appropriate validators: `IsString`, `IsNumber`, `IsEmail`, `IsBoolean`, etc.
- Use constraints: `Min`, `Max`, `Length`, `IsPositive`, etc.
- Always provide custom error messages
- Use `@IsOptional()` for nullable/optional fields

---

## 🎮 CONTROLLERS

### Location
`src/infrastructure/adapters/inbound/http/controllers/{feature-name}.controller.ts`

### Structure Template

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IFeatureNameApplicationPort } from '../../../../../core/application/ports/inbound/feature-name-application.port';
import { CreateEntityDto, UpdateEntityDto, EntityResponseDto } from '../dtos/feature-name';

@ApiTags('Feature Name')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/feature-name')
export class FeatureNameController {
  constructor(
    private readonly applicationService: IFeatureNameApplicationPort,
  ) {}

  @Post()
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new entity' })
  @ApiResponse({
    status: 201,
    description: 'Entity created successfully',
    type: EntityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async createEntity(
    @Body() createDto: CreateEntityDto,
  ): Promise<EntityResponseDto> {
    try {
      const result = await this.applicationService.createEntity({
        fieldName: createDto.fieldName,
      });

      return this.mapToResponseDto(result);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Entity found',
    type: EntityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async getEntityById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EntityResponseDto> {
    const result = await this.applicationService.getEntityById(id);

    if (!result) {
      throw new NotFoundException('Entity not found');
    }

    return this.mapToResponseDto(result);
  }

  private mapToResponseDto(entity: DomainEntity): EntityResponseDto {
    return {
      id: entity.id!,
      fieldName: entity.fieldName,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
```

### Rules

1. **MUST inject Application Port (interface), NOT service directly**
2. **MUST use HTTP status codes appropriately**
3. **MUST convert Application errors to HTTP exceptions**
4. **MUST use `ParseIntPipe` for numeric parameters**
5. **MUST have Swagger documentation for all endpoints**
6. **MUST use guards for authentication/authorization**
7. **MUST map Domain entities to Response DTOs**
8. **MUST handle null/undefined cases with appropriate HTTP status**

### HTTP Status Codes

- `200 OK` - Successful GET, PUT
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation errors, bad input
- `401 Unauthorized` - Missing/invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate)

---

## 🔌 PROVIDERS AND DEPENDENCY INJECTION

### Provider Types

#### 1. Repository Entity Providers
**Location**: `src/infrastructure/providers/{feature}/repository-entities.providers.ts`

```typescript
import { DataSource } from 'typeorm';
import { EntityNameEntity } from '../../persistence/entity-name.entity';
import { MYSQL_REPOSITORY } from '../../tokens/repositories';
import { DATA_SOURCE } from '../../tokens/data_sources';

export const repositoryEntityProviders = [
  {
    provide: MYSQL_REPOSITORY.ENTITY_NAME,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(EntityNameEntity),
    inject: [DATA_SOURCE.MYSQL],
  },
];
```

#### 2. Repository Adapter Providers
**Location**: `src/infrastructure/providers/{feature}/repository.providers.ts`

```typescript
import { REPOSITORY_PORTS } from '../../tokens/ports';
import { EntityNameRepositoryAdapter } from '../../adapters/outbound/repositories/entity-name-repository.adapter';

export const repositoryProviders = [
  {
    provide: REPOSITORY_PORTS.ENTITY_NAME,
    useClass: EntityNameRepositoryAdapter,
  },
];
```

#### 3. Application Service Providers
**Location**: `src/infrastructure/providers/{feature}/application.providers.ts`

```typescript
import { APPLICATION_PORTS } from './application-ports';
import { FeatureNameApplicationService } from '../../../core/application/services/feature-name-application.service';

export const APPLICATION_PORTS = {
  FEATURE_NAME: 'IFeatureNameApplicationPort',
} as const;

export const applicationProviders = [
  {
    provide: APPLICATION_PORTS.FEATURE_NAME,
    useClass: FeatureNameApplicationService,
  },
];
```

#### 4. Domain Service Providers
**Location**: `src/infrastructure/providers/{feature}/domain-services.providers.ts`

```typescript
import { ServiceNameDomainService } from '../../../core/domain/services/service-name.domain-service';

export const domainServiceProviders = [
  ServiceNameDomainService,
];
```

#### 5. Combined Providers
**Location**: `src/infrastructure/providers/{feature}/index.ts` or `{feature}.providers.ts`

```typescript
import { repositoryEntityProviders } from './repository-entities.providers';
import { repositoryProviders } from './repository.providers';
import { applicationProviders } from './application.providers';
import { domainServiceProviders } from './domain-services.providers';

export const featureProviders = [
  ...repositoryEntityProviders,
  ...repositoryProviders,
  ...applicationProviders,
  ...domainServiceProviders,
];
```

### Rules

1. **Repository Entity Providers MUST use `useFactory` with DataSource**
2. **Repository Adapter Providers MUST use `useClass`**
3. **Application Service Providers MUST use `useClass`**
4. **Domain Service Providers can be direct class references**
5. **ALWAYS use tokens from `tokens/` directory**
6. **Provider order matters: Entities → Adapters → Services**

---

## 🏷️ TOKENS

### Location
`src/infrastructure/tokens/`

### Repository Tokens
**File**: `repositories.ts`

```typescript
export const MYSQL_REPOSITORY = {
  ENTITY_NAME: 'ENTITY_NAME_REPOSITORY',
  // ... other repositories
} as const;
```

### Repository Port Tokens
**File**: `ports.ts`

```typescript
export const REPOSITORY_PORTS = {
  ENTITY_NAME: 'IEntityNameRepositoryPort',
  // ... other ports
} as const;
```

### Application Port Tokens
**File**: Defined in each feature's `application.providers.ts`

```typescript
export const APPLICATION_PORTS = {
  FEATURE_NAME: 'IFeatureNameApplicationPort',
} as const;
```

### Data Source Tokens
**File**: `data_sources.ts`

```typescript
export const DATA_SOURCE = {
  MYSQL: 'MYSQL_DATA_SOURCE',
} as const;
```

### Rules

1. **MUST use `as const` for type safety**
2. **MUST be in UPPER_SNAKE_CASE**
3. **MUST be exported as const objects**
4. **Repository tokens: `{ENTITY}_REPOSITORY`**
5. **Port tokens: Interface name as string**

---

## 📦 NESTJS MODULES

### Location
`src/infrastructure/modules/{feature}/{feature}.module.ts`

### Structure Template

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { EntityNameEntity } from '../../persistence/entity-name.entity';

// Controllers
import { FeatureNameController } from '../../adapters/inbound/http/controllers/feature-name.controller';

// Providers
import { featureProviders } from '../../providers/feature';

// External dependencies
import { RelatedModule } from '../related/related.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EntityNameEntity,
    ]),
    RelatedModule, // If cross-module dependencies
  ],
  controllers: [
    FeatureNameController,
  ],
  providers: [
    ...featureProviders,
  ],
  exports: [
    // Export application services for use in other modules
    ...featureProviders,
  ],
})
export class FeatureModule {}
```

### Rules

1. **MUST import `TypeOrmModule.forFeature([...entities])`**
2. **MUST import all related modules if dependencies exist**
3. **MUST include all controllers**
4. **MUST include all providers**
5. **MUST export providers if used by other modules**
6. **Module name MUST be PascalCase: `FeatureNameModule`**

### Module Registration

**MUST register in `AppModule`**:

```typescript
import { FeatureModule } from './modules/feature/feature.module';

@Module({
  imports: [
    // ... other modules
    FeatureModule,
  ],
})
export class AppModule {}
```

---

## 🗄️ MIGRATIONS

### Location
`src/infrastructure/migrations/{timestamp}-{MigrationName}.ts`

### Structure Template

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationName{timestamp} implements MigrationInterface {
  name = 'MigrationName{timestamp}';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table already exists
    const tableExists = await queryRunner.hasTable('table_name');
    if (tableExists) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE \`inderbu\`.\`table_name\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`field_name\` VARCHAR(255) NOT NULL,
        \`fk_related_id\` INT NOT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_table_field\` (\`field_name\`),
        CONSTRAINT \`fk_table_related\` FOREIGN KEY (\`fk_related_id\`)
          REFERENCES \`inderbu\`.\`related_table\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`inderbu\`.\`table_name\``);
  }
}
```

### Rules

1. **MUST check if table exists before creating**
2. **MUST use schema name: `inderbu`**
3. **MUST use backticks for table/column names**
4. **MUST include `created_at` and `updated_at`**
5. **MUST define indexes for foreign keys**
6. **MUST define appropriate foreign key constraints**
7. **MUST implement `down()` method for rollback**
8. **MUST use descriptive migration names**

### Naming Convention

- File: `{timestamp}-{Action}{Entity}Table.ts`
- Class: `{Action}{Entity}Table{timestamp}`
- Examples:
  - `1765426541000-CreateTemplatesTable.ts`
  - `1765426542000-CreateReceiptsTable.ts`
  - `1765426544000-AddJustificationToReservations.ts`

---

## 📝 NAMING CONVENTIONS

### Files

- **Domain Entities**: `{entity-name}.domain-entity.ts`
- **Persistence Entities**: `{entity-name}.entity.ts`
- **Mappers**: `{entity-name}-entity.mapper.ts`
- **Repository Ports**: `{entity-name}-repository.port.ts`
- **Repository Adapters**: `{entity-name}-repository.adapter.ts`
- **Domain Services**: `{service-name}.domain-service.ts`
- **Application Ports**: `{feature-name}-application.port.ts`
- **Application Services**: `{feature-name}-application.service.ts`
- **DTOs**: `{action}-{entity}.dto.ts` (e.g., `create-sub-scenario-price.dto.ts`)
- **Controllers**: `{feature-name}.controller.ts`
- **Modules**: `{feature-name}.module.ts`

### Classes

- **Domain Entities**: `{EntityName}DomainEntity`
- **Builders**: `{EntityName}DomainBuilder`
- **Persistence Entities**: `{EntityName}Entity`
- **Mappers**: `{EntityName}EntityMapper`
- **Repository Ports**: `I{EntityName}RepositoryPort`
- **Repository Adapters**: `{EntityName}RepositoryAdapter`
- **Domain Services**: `{ServiceName}DomainService`
- **Application Ports**: `I{FeatureName}ApplicationPort`
- **Application Services**: `{FeatureName}ApplicationService`
- **Controllers**: `{FeatureName}Controller`
- **DTOs**: `{Action}{EntityName}Dto` (e.g., `CreateSubScenarioPriceDto`)

### Variables and Properties

- **camelCase** for variables, properties, methods
- **PascalCase** for classes, interfaces, types
- **UPPER_SNAKE_CASE** for constants and tokens
- **snake_case** for database tables and columns

---

## ✅ VALIDATIONS

### Domain Level

- Domain entities MUST validate business rules
- Use methods like `validateBusinessRule()` in entities
- Return structured results: `{ isValid: boolean; reason?: string }`

### Application Level

- Application services MUST validate before operations
- Use Domain Services for complex validations
- Throw `Error` with descriptive messages

### DTO Level

- Use `class-validator` decorators
- Provide custom error messages
- Use appropriate constraints (`Min`, `Max`, `Length`, etc.)

### Example

```typescript
// Domain Entity
validatePrice(): boolean {
  return this.hourlyPrice > 0;
}

// Domain Service
validateHourlyPrice(price: number): { isValid: boolean; reason?: string } {
  if (price <= 0) {
    return { isValid: false, reason: 'Price must be greater than 0' };
  }
  if (price > 10000) {
    return { isValid: false, reason: 'Price cannot exceed $10,000' };
  }
  return { isValid: true };
}

// DTO
@IsNumber({}, { message: 'Price must be a number' })
@IsPositive({ message: 'Price must be greater than 0' })
@Max(10000, { message: 'Price cannot exceed $10,000' })
hourlyPrice: number;
```

---

## ⚠️ ERROR HANDLING

### Application Services

```typescript
// ✅ CORRECT - Throw Error
if (!entity) {
  throw new Error('Entity not found');
}

// ❌ WRONG - HTTP exceptions
if (!entity) {
  throw new NotFoundException('Entity not found');
}
```

### Controllers

```typescript
// ✅ CORRECT - Convert to HTTP exception
try {
  const result = await this.service.createEntity(dto);
  return this.mapToResponseDto(result);
} catch (error) {
  throw new BadRequestException(error.message);
}

// Handle specific cases
if (!result) {
  throw new NotFoundException('Entity not found');
}
```

### Rules

1. **Application Services**: Throw `Error` with messages
2. **Controllers**: Convert to appropriate HTTP exceptions
3. **Always provide descriptive error messages**
4. **Use appropriate HTTP status codes**

---

## 🧪 TESTING

### Unit Tests

- Test Domain entities and business logic
- Test Domain Services
- Test Mappers
- Mock Repository Ports in Application Service tests

### Integration Tests

- Test Repository Adapters with test database
- Test full flow: Controller → Service → Repository

### Rules

1. **Mock Repository Ports (interfaces), not adapters**
2. **Test business logic in isolation**
3. **Use test database for integration tests**
4. **Clean up test data after tests**

---

## 📚 SUMMARY CHECKLIST

When creating a new feature, follow this order:

1. ✅ Create Migration
2. ✅ Create Persistence Entity
3. ✅ Create Domain Entity with Builder
4. ✅ Create Mapper
5. ✅ Create Repository Port (interface)
6. ✅ Create Repository Adapter (implementation)
7. ✅ Create Domain Service (if needed)
8. ✅ Create Application Port (interface)
9. ✅ Create Application Service (implementation)
10. ✅ Create DTOs (Request/Response)
11. ✅ Create Controller
12. ✅ Create Providers (all types)
13. ✅ Create Module
14. ✅ Register Module in AppModule
15. ✅ Test

---

## 🚫 COMMON MISTAKES TO AVOID

1. ❌ Using `@InjectRepository()` in services
2. ❌ Direct instantiation of Domain entities
3. ❌ Returning Persistence entities from services
4. ❌ HTTP exceptions in Application Services
5. ❌ Direct TypeORM repository usage in services
6. ❌ Skipping the Builder pattern for Domain entities
7. ❌ Not using Mappers for conversions
8. ❌ Injecting concrete classes instead of interfaces
9. ❌ Missing validation in Application Services
10. ❌ Not registering providers in Module

---

**Last Updated**: 2025-12-12
**Version**: 1.0.0


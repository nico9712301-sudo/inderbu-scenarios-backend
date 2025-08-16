# Gestión de Imágenes de Sub-Escenarios - Flujo Backend

Este documento describe línea por línea el flujo completo de gestión de imágenes en el backend para sub-escenarios, incluyendo upload, eliminación, versionado y gestión de estado histórico.

## Arquitectura General

### Capas de la Aplicación
- **Controller Layer**: `SubScenarioImageController` - Endpoints HTTP
- **Application Layer**: `SubScenarioImageApplicationService` - Lógica de aplicación
- **Domain Layer**: `SubScenarioImageDomainEntity` - Entidades de dominio
- **Infrastructure Layer**: `SubScenarioImageRepositoryAdapter` - Acceso a datos

### Estructura de Datos

```typescript
// Domain Entity
class SubScenarioImageDomainEntity {
  public readonly id?: number;
  public readonly path: string;
  public readonly isFeature: boolean;
  public readonly displayOrder: number;
  public readonly subScenarioId: number;
  public readonly current: boolean; // Campo de versionado
  public readonly createdAt?: Date;
}

// Persistence Entity
@Entity('sub_scenario_images')
class SubScenarioImageEntity {
  @Column({ type: 'boolean', default: true })
  current: boolean; // true = actual, false = histórica
}
```

## Endpoints Disponibles

### 1. Upload de Imágenes (Creación/Adición)
- **Endpoint**: `POST /sub-scenarios/:id/images`
- **Uso**: Creación de sub-escenarios, adición de nuevas imágenes

### 2. Gestión Completa de Imágenes (Edición Masiva)
- **Endpoint**: `POST /sub-scenarios/:id/manage-images`
- **Uso**: Edición donde se envían solo las imágenes deseadas

### 3. Eliminación Individual
- **Endpoint**: `DELETE /sub-scenarios/:id/images/:imageId`
- **Uso**: Eliminación específica de una imagen

### 4. Consulta de Imágenes
- **Endpoint**: `GET /sub-scenarios/:id/images`
- **Parámetros**: `?includeHistorical=true/false`

## Casos de Uso Detallados

### Caso 1: Upload de Imágenes (Creación)

#### Ubicación: `src/infrastructure/adapters/inbound/http/controllers/sub-scenario-image.controller.ts`

**Paso 1: Recepción del Request**
```typescript
// Línea 33-50: Endpoint de upload múltiple
@Post(':subScenarioId/images')
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'file1', maxCount: 1 },
    { name: 'file2', maxCount: 1 },
    { name: 'file3', maxCount: 1 },
  ])
)
async uploadImages(
  @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
  @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
  @Body() body: any,
): Promise<SubScenarioImageResponseDto[]>
```

**Paso 2: Validación de Archivos**
```typescript
// Línea 53-56: Verificación de archivos válidos
if (!files || Object.keys(files).length === 0) {
  throw new BadRequestException('No se han proporcionado archivos válidos');
}
```

**Paso 3: Procesamiento de Cada Archivo**
```typescript
// Línea 65-83: Procesamiento de file1
if (files.file1 && files.file1.length > 0) {
  const file = files.file1[0];
  const buffer = fs.readFileSync(file.path); // Lectura del archivo temporal
  const multerFileWithBuffer = { ...file, buffer }; // Agregar buffer al objeto
  
  const isFeature1 = body.isFeature1 === 'true' || body.isFeature1 === true;
  const displayOrder1 = body.displayOrder1 ? parseInt(body.displayOrder1, 10) : 0;
  
  const result = await this.imageApplicationService.uploadImage(
    subScenarioId,
    multerFileWithBuffer,
    isFeature1,
    displayOrder1
  );
  
  results.push(result);
  allFiles.push(file);
}
```

**Paso 4: Llamada al Service**
```typescript
// src/core/application/services/sub-scenario-image-application.service.ts
// Línea 26-68: Método uploadImage
async uploadImage(
  subScenarioId: number,
  file: Express.Multer.File,
  isFeature: boolean = false,
  displayOrder: number = 0,
): Promise<SubScenarioImageResponseDto>
```

**Paso 5: Validación del Sub-Escenario**
```typescript
// Línea 32-36: Verificación de existencia
const subScenario = await this.subScenarioRepository.findById(subScenarioId);
if (!subScenario) {
  throw new NotFoundException(`SubScenario con ID ${subScenarioId} no encontrado`);
}
```

**Paso 6: Guardado del Archivo**
```typescript
// Línea 38-39: Uso del servicio de almacenamiento
const relativePath = await this.fileStorageService.saveFile(file);
```

**Paso 7: Cálculo de Orden Automático**
```typescript
// Línea 41-50: Auto-cálculo de displayOrder para imágenes no-feature
let order = displayOrder;
if (!isFeature && displayOrder === 0) {
  const existingImages = await this.imageRepository.findBySubScenarioId(subScenarioId, false);
  if (existingImages.length > 0) {
    const maxOrder = Math.max(...existingImages.map(img => img.displayOrder));
    order = maxOrder + 1;
  }
}
```

**Paso 8: Versionado de Imágenes Existentes**
```typescript
// Línea 52-55: Marcado como históricas solo en la misma posición
await this.imageRepository.markAsHistoricalByPosition(subScenarioId, isFeature, order);
```

**Implementación de `markAsHistoricalByPosition`:**
```typescript
// src/infrastructure/adapters/outbound/repositories/sub-scenario-image-repository.adapter.ts
// Línea 160-170: Método específico por posición
async markAsHistoricalByPosition(subScenarioId: number, isFeature: boolean, displayOrder: number): Promise<void> {
  const where = { 
    subScenario: { id: subScenarioId },
    isFeature,
    displayOrder,
    current: true // Solo marcar las actuales
  };

  await this.repository.update(where, { current: false });
}
```

**Paso 9: Creación de la Nueva Entidad**
```typescript
// Línea 57-65: Builder pattern para crear entidad de dominio
const imageDomain = SubScenarioImageDomainEntity.builder()
  .withPath(relativePath)
  .withIsFeature(isFeature)
  .withDisplayOrder(order)
  .withSubScenarioId(subScenarioId)
  .withCurrent(true) // Nueva imagen siempre actual
  .build();
```

**Paso 10: Persistencia y Respuesta**
```typescript
// Línea 66-67: Guardado y mapeo de respuesta
const savedImage = await this.imageRepository.save(imageDomain);
return SubScenarioImageResponseMapper.toDto(savedImage);
```

### Caso 2: Gestión Masiva de Imágenes

#### Endpoint: `POST /sub-scenarios/:id/manage-images`

**Paso 1: Configuración del Interceptor**
```typescript
// Línea 186-197: Interceptor específico para manage-images
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'featured', maxCount: 1 },
    { name: 'additional1', maxCount: 1 },
    { name: 'additional2', maxCount: 1 },
  ])
)
```

**Paso 2: Recepción de Archivos Específicos**
```typescript
// Línea 198-205: Tipado específico de archivos
async manageImages(
  @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
  @UploadedFiles() files: { 
    featured?: Express.Multer.File[], 
    additional1?: Express.Multer.File[], 
    additional2?: Express.Multer.File[] 
  },
): Promise<SubScenarioImageResponseDto[]>
```

**Paso 3: Preparación de Archivos**
```typescript
// Línea 210-240: Procesamiento por slot específico
const imageUpdates: {
  featured?: Express.Multer.File;
  additional1?: Express.Multer.File;
  additional2?: Express.Multer.File;
} = {};

// Procesar imagen featured
if (files.featured && files.featured.length > 0) {
  const file = files.featured[0];
  const buffer = fs.readFileSync(file.path);
  imageUpdates.featured = { ...file, buffer };
  allFiles.push(file);
}
```

**Paso 4: Llamada al Service de Gestión**
```typescript
// Línea 243: Invocación del service
const results = await this.imageApplicationService.manageImages(subScenarioId, imageUpdates);
```

**Implementación del Service `manageImages`:**
```typescript
// Línea 101-171: Método de gestión completa
async manageImages(
  subScenarioId: number,
  imageUpdates: {
    featured?: Express.Multer.File;
    additional1?: Express.Multer.File;
    additional2?: Express.Multer.File;
  }
): Promise<SubScenarioImageResponseDto[]>
```

**Paso 5: Obtención del Estado Actual**
```typescript
// Línea 117-125: Mapeo de imágenes actuales
const currentImages = await this.imageRepository.findBySubScenarioId(subScenarioId, false);

const currentImagesByPosition = new Map<string, boolean>();
for (const image of currentImages) {
  let positionKey: string;
  if (image.isFeature) {
    positionKey = 'featured';
  } else if (image.displayOrder === 1) {
    positionKey = 'additional1';
  } else if (image.displayOrder === 2) {
    positionKey = 'additional2';
  }
  currentImagesByPosition.set(positionKey, true);
}
```

**Paso 6: Procesamiento de Cada Posición**
```typescript
// Línea 134-158: Lógica condicional por posición
for (const position of positions) {
  const file = imageUpdates[position.key as keyof typeof imageUpdates];
  
  if (file) {
    // Si se envía archivo, reemplazar la imagen en esta posición
    const result = await this.uploadImage(
      subScenarioId,
      file,
      position.isFeature,
      position.displayOrder
    );
    results.push(result);
  } else {
    // Si NO se envía archivo Y existe una imagen actual, marcarla como histórica
    const hasCurrentImage = currentImagesByPosition.get(position.key);
    if (hasCurrentImage) {
      await this.imageRepository.markAsHistoricalByPosition(
        subScenarioId,
        position.isFeature,
        position.displayOrder
      );
    }
  }
}
```

### Caso 3: Eliminación Individual

#### Endpoint: `DELETE /sub-scenarios/:id/images/:imageId`

**Paso 1: Definición del Endpoint**
```typescript
// Línea 186-200: Endpoint de eliminación
@Delete(':subScenarioId/images/:imageId')
@ApiOperation({ summary: 'Elimina una imagen específica marcándola como histórica' })
async deleteImage(
  @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
  @Param('imageId', ParseIntPipe) imageId: number,
): Promise<{ success: boolean; message: string }>
```

**Paso 2: Llamada al Service**
```typescript
// Línea 194-199: Invocación y respuesta
await this.imageApplicationService.deleteImage(imageId);
return {
  success: true,
  message: 'Imagen marcada como histórica exitosamente'
};
```

**Implementación del Service `deleteImage`:**
```typescript
// Línea 173-191: Método de eliminación lógica
async deleteImage(imageId: number): Promise<void> {
  const image = await this.imageRepository.findById(imageId);
  if (!image) {
    throw new NotFoundException(`Imagen con ID ${imageId} no encontrada`);
  }

  // Mark image as historical (current: false)
  const updatedImage = SubScenarioImageDomainEntity.builder()
    .withId(image.id!)
    .withPath(image.path)
    .withIsFeature(image.isFeature)
    .withDisplayOrder(image.displayOrder)
    .withSubScenarioId(image.subScenarioId)
    .withCurrent(false) // Marcar como histórica
    .withCreatedAt(image.createdAt ?? new Date())
    .build();

  await this.imageRepository.save(updatedImage);
}
```

### Caso 4: Consulta de Imágenes

#### Endpoint: `GET /sub-scenarios/:id/images`

**Paso 1: Endpoint con Parámetro Opcional**
```typescript
// Línea 153-162: Endpoint de consulta
@Get(':subScenarioId/images')
async getImages(
  @Param('subScenarioId', ParseIntPipe) subScenarioId: number,
  @Query('includeHistorical', new ParseBoolPipe({ optional: true })) includeHistorical?: boolean,
): Promise<SubScenarioImageResponseDto[]> {
  return this.imageApplicationService.getImagesBySubScenarioId(subScenarioId, includeHistorical || false);
}
```

**Implementación del Repository:**
```typescript
// src/infrastructure/adapters/outbound/repositories/sub-scenario-image-repository.adapter.ts
// Línea 35-57: Método findBySubScenarioId con filtrado
async findBySubScenarioId(
  subScenarioId: number,
  includeHistorical: boolean = false,
): Promise<SubScenarioImageDomainEntity[]> {
  const where: any = { subScenario: { id: subScenarioId } };
  
  // Por defecto, solo traer imágenes actuales (current: true)
  if (!includeHistorical) {
    where.current = true;
  }

  const entities = await this.repository.find({
    where,
    relations: ['subScenario'],
    order: { isFeature: 'DESC', displayOrder: 'ASC' },
  });
  return entities.map(SubScenarioImageEntityMapper.toDomain);
}
```

## Sistema de Versionado

### Campo `current`

**Base de Datos:**
```sql
ALTER TABLE sub_scenario_images 
ADD COLUMN current BOOLEAN DEFAULT TRUE;
```

**Comportamiento:**
- `current: true` → Imagen visible y activa
- `current: false` → Imagen histórica, no visible por defecto

### Estrategias de Versionado

#### 1. Versionado por Posición (Actual)
```typescript
// Solo marca como histórica la imagen en la misma posición
markAsHistoricalByPosition(subScenarioId, isFeature, displayOrder)
```

#### 2. Versionado Global (Legacy)
```typescript
// Marca como históricas TODAS las imágenes del sub-escenario
markAsHistorical(subScenarioId, exceptIds?)
```

## Flujo de Estados de Imagen

### Estados Posibles:

1. **Nueva Imagen**:
   ```
   current: true (por defecto)
   createdAt: NOW()
   ```

2. **Imagen Reemplazada**:
   ```
   Imagen anterior: current: false
   Imagen nueva: current: true
   ```

3. **Imagen Eliminada**:
   ```
   current: false (marcada como histórica)
   ```

4. **Imagen Restaurada** (futuro):
   ```
   current: true (cambio de false a true)
   ```

## Mappers y Transformadores

### Domain Entity Mapper
```typescript
// src/infrastructure/mappers/images/image-entity.mapper.ts
class SubScenarioImageEntityMapper {
  static toDomain(entity: SubScenarioImageEntity): SubScenarioImageDomainEntity {
    return SubScenarioImageDomainEntity.builder()
      .withId(entity.id)
      .withPath(entity.path)
      .withIsFeature(entity.isFeature)
      .withDisplayOrder(entity.displayOrder)
      .withSubScenarioId(entity.subScenario.id)
      .withCurrent(entity.current) // Mapeo del campo de versionado
      .withCreatedAt(entity.createdAt)
      .build();
  }

  static toPersistence(domain: SubScenarioImageDomainEntity): SubScenarioImageEntity {
    const entity = new SubScenarioImageEntity();
    entity.id = domain.id;
    entity.path = domain.path;
    entity.isFeature = domain.isFeature;
    entity.displayOrder = domain.displayOrder;
    entity.current = domain.current; // Mapeo del campo de versionado
    entity.createdAt = domain.createdAt;
    return entity;
  }
}
```

### Response Mapper
```typescript
// src/infrastructure/mappers/images/image-response.mapper.ts
class SubScenarioImageResponseMapper {
  static toDto(domain: SubScenarioImageDomainEntity): SubScenarioImageResponseDto {
    return {
      id: domain.id!,
      path: domain.path,
      isFeature: domain.isFeature,
      displayOrder: domain.displayOrder,
      subScenarioId: domain.subScenarioId,
      current: domain.current, // Campo expuesto en API
      createdAt: domain.createdAt?.toISOString(),
    };
  }
}
```

## Validaciones y Constraints

### Base de Datos
```sql
-- Constraint para evitar múltiples imágenes featured actuales
CREATE UNIQUE INDEX idx_unique_featured_current 
ON sub_scenario_images (sub_scenario_id, is_feature) 
WHERE is_feature = true AND current = true;

-- Constraint para orden único por posición y estado
CREATE UNIQUE INDEX idx_unique_display_order_current 
ON sub_scenario_images (sub_scenario_id, display_order, current) 
WHERE current = true;
```

### Validaciones de Negocio
```typescript
// En el repository save method
if (image.isFeature) {
  // Si es una imagen principal, asegurarse de que no haya otras actuales
  await this.repository.update(
    { subScenario: { id: image.subScenarioId }, isFeature: true, current: true },
    { current: false },
  );
}
```

## Casos de Error y Manejo

### Error de Archivo No Válido
```typescript
// Controller level validation
if (!files || Object.keys(files).length === 0) {
  throw new BadRequestException('No se han proporcionado archivos válidos');
}
```

### Error de Sub-Escenario No Existente
```typescript
// Service level validation
const subScenario = await this.subScenarioRepository.findById(subScenarioId);
if (!subScenario) {
  throw new NotFoundException(`SubScenario con ID ${subScenarioId} no encontrado`);
}
```

### Error de Imagen No Encontrada
```typescript
// Service level validation
const image = await this.imageRepository.findById(imageId);
if (!image) {
  throw new NotFoundException(`Imagen con ID ${imageId} no encontrada`);
}
```

### Manejo de Archivos Temporales
```typescript
// Controller cleanup
try {
  // Operaciones con archivos
} finally {
  // Limpiar archivos temporales
  for (const file of allFiles) {
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.error('Error al eliminar archivo temporal:', err);
    }
  }
}
```

## Optimizaciones

### Queries Optimizadas
```typescript
// Usar relaciones específicas
const entities = await this.repository.find({
  where,
  relations: ['subScenario'], // Solo relaciones necesarias
  order: { isFeature: 'DESC', displayOrder: 'ASC' },
});
```

### Batch Operations
```typescript
// Actualización en lote para marcado histórico
await this.repository.update(where, { current: false });
```

### Índices de Base de Datos
```sql
-- Índice para consultas por sub-escenario y estado actual
CREATE INDEX idx_sub_scenario_current ON sub_scenario_images (sub_scenario_id, current);

-- Índice para orden de display
CREATE INDEX idx_display_order ON sub_scenario_images (sub_scenario_id, display_order);
```

## Puntos Críticos de Seguridad

1. **Validación de Tipos de Archivo**: Solo en frontend, backend confía en validación previa
2. **Sanitización de Rutas**: FileStorageService maneja paths seguros
3. **Autorización**: Verificar que usuario puede modificar el sub-escenario
4. **Límites de Tamaño**: Configurado en Multer interceptor
5. **Prevención de Path Traversal**: En FileStorageService

## Monitoreo y Logging

### Logs Importantes
```typescript
// Operaciones críticas siempre loggeadas
console.log(`Uploading images for sub-scenario ID: ${subScenarioId}`);
console.log(`Deleting ${imagesToDelete.length} images`);
console.error('Error fetching images:', error);
```

### Métricas Sugeridas
- Número de uploads por sub-escenario
- Tiempo de procesamiento de archivos
- Errores de validación de archivos
- Imágenes históricas vs actuales
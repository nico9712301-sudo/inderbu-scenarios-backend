# TypeORM Migrations

Este directorio contiene las migraciones de base de datos para el proyecto.

## 📋 Comandos Disponibles

### Generar una nueva migración
```bash
npm run migration:generate -- NombreDescriptivo
```
Genera una migración basada en los cambios detectados en las entidades.

### Crear una migración vacía
```bash
npm run migration:create -- NombreDescriptivo
```
Crea una migración vacía donde puedes escribir SQL personalizado.

### Ejecutar migraciones pendientes
```bash
npm run migration:run
# O usando el CLI
npm run cli -- migration:run
```

### Revertir última migración
```bash
npm run migration:revert
# O usando el CLI
npm run cli -- migration:revert
```

### Ver estado de migraciones
```bash
npm run migration:show
# O usando el CLI
npm run cli -- migration:show
```

## 🔄 Flujo de Trabajo

1. **Desarrollo Local:**
   - Modifica las entidades en `src/infrastructure/persistence/`
   - Genera la migración: `npm run migration:generate -- NombreDescriptivo`
   - Revisa el archivo generado en `src/infrastructure/migrations/`
   - Prueba la migración: `npm run migration:run`

2. **Producción:**
   - Las migraciones se ejecutan manualmente o en el proceso de deployment
   - **NUNCA** uses `synchronize: true` en producción
   - Ejecuta migraciones antes de desplegar el código nuevo

## ⚠️ Importante

- **Nunca edites migraciones ya ejecutadas en producción**
- **Siempre revisa las migraciones generadas antes de ejecutarlas**
- **Haz backup de la base de datos antes de ejecutar migraciones en producción**
- **Las migraciones se ejecutan en orden cronológico (por timestamp)**

## 📝 Convenciones de Nomenclatura

Usa nombres descriptivos para las migraciones:
- ✅ `AddUserEmailIndex`
- ✅ `CreateReservationTable`
- ✅ `UpdateScenarioAddAddressField`
- ❌ `Migration1`
- ❌ `Fix`

## 🔍 Verificación

Después de generar una migración, verifica:
1. Que el SQL generado sea correcto
2. Que no haya datos que se pierdan
3. Que las foreign keys estén correctas
4. Que los índices sean necesarios


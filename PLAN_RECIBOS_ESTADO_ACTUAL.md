# Plan: Estado Actual del Sistema de Recibos

## 📋 Revisión del Estado Actual

### ✅ Lo que ESTÁ implementado correctamente:

1. **Base de Datos:**
   - ✅ Tabla `receipts` existe con relación `fk_reservation_id` (Many-to-One)
   - ✅ Una reserva puede tener MÚLTIPLES recibos (relación correcta)
   - ✅ Campo `pdf_url` para guardar el link del PDF
   - ✅ Campos de auditoría: `generated_at`, `sent_at`, `sent_to_email`

2. **Flujo de Generación:**
   - ✅ Procesa template → genera HTML
   - ✅ Convierte HTML a PDF usando Puppeteer
   - ✅ Sube PDF a Cloudflare R2
   - ✅ Guarda el recibo con `pdfUrl` en la base de datos

3. **Repositorio:**
   - ✅ `findByReservationId()` - permite obtener múltiples recibos por reserva
   - ✅ `save()` - guarda recibos nuevos
   - ✅ Métodos para consultar recibos enviados/no enviados

4. **Servicios:**
   - ✅ `PdfGenerationService` - genera PDF y sube a R2
   - ✅ `CloudflareR2Service` - maneja uploads a R2
   - ✅ `ReceiptManagementApplicationService` - orquesta el flujo completo

### ❌ Problemas Identificados:

1. **Puppeteer no tiene Chrome instalado:**
   - ❌ Error: "Could not find Chrome (ver. 143.0.7499.42)"
   - ❌ El servicio `PdfGenerationService` falla al intentar lanzar Puppeteer
   - ❌ No hay script de instalación automática de Chrome

2. **Cálculo de horas incorrecto:**
   - ⚠️ El método `prepareReceiptData` usa placeholders en lugar de calcular desde timeslots reales
   - ⚠️ Ya se corrigió parcialmente pero necesita verificación

## 🔧 Plan de Corrección

### Paso 1: Instalar Chrome para Puppeteer

**Opción A: Instalación manual (inmediata)**
```bash
cd /Users/npicon/Documents/projects/personal/inderbu/inderbu-scenarios-backend
npx puppeteer browsers install chrome
```

**Opción B: Script automático en package.json**
- ✅ Ya agregado: `"postinstall": "puppeteer browsers install chrome"`
- Ejecutar: `npm install` o `pnpm install` para que se ejecute automáticamente

**Opción C: Configurar Puppeteer para usar Chrome del sistema**
- Modificar `PdfGenerationService` para detectar Chrome instalado en el sistema
- Usar `executablePath` si Chrome está en ubicación estándar

### Paso 2: Verificar cálculo de horas

- ✅ Ya corregido: `prepareReceiptData` ahora calcula desde timeslots
- ⚠️ Verificar que `findById` carga las relaciones `timeslots` y `timeslots.timeslot`
- ⚠️ Verificar que el cálculo funciona para reservas SINGLE y RANGE

### Paso 3: Verificar flujo completo

1. **Generación de PDF:**
   - ✅ Template → HTML (funciona)
   - ❌ HTML → PDF (falla por Chrome)
   - ✅ PDF → R2 (debería funcionar si PDF se genera)
   - ✅ R2 → Guardar URL en BD (debería funcionar)

2. **Múltiples recibos por reserva:**
   - ✅ Tabla permite múltiples registros con mismo `fk_reservation_id`
   - ✅ `findByReservationId()` retorna array de recibos
   - ✅ Frontend puede mostrar lista de recibos

## 📝 Resumen del Flujo Actual

```
Frontend (generateReceiptAction)
  ↓
Backend Controller (POST /api/receipts/generate)
  ↓
ReceiptManagementApplicationService.generateReceipt()
  ├─ Valida reserva existe
  ├─ Valida template existe y activo
  ├─ Valida sub-escenario tiene costo
  ├─ Obtiene pricing (puede ser null)
  ├─ Prepara datos del recibo (calcula horas desde timeslots) ✅
  ├─ Procesa template → HTML ✅
  ├─ Genera PDF desde HTML (Puppeteer) ❌ FALLA AQUÍ
  ├─ Sube PDF a R2 (CloudflareR2Service) ⏸️ No se ejecuta
  └─ Guarda recibo con pdfUrl en BD ⏸️ No se ejecuta
```

## 🎯 Acciones Inmediatas

1. **Instalar Chrome para Puppeteer:**
   ```bash
   cd /Users/npicon/Documents/projects/personal/inderbu/inderbu-scenarios-backend
   npx puppeteer browsers install chrome
   ```

2. **Verificar que el script postinstall funciona:**
   - El `package.json` ya tiene `"postinstall": "puppeteer browsers install chrome"`
   - Ejecutar `pnpm install` para verificar

3. **Probar generación de recibo:**
   - Una vez instalado Chrome, probar generar un recibo
   - Verificar que el PDF se sube a R2
   - Verificar que se guarda en BD con el pdfUrl correcto

## ✅ Confirmación del Diseño

**Sí, el backend está diseñado correctamente para:**
- ✅ Generar PDF
- ✅ Subir a R2 de Cloudflare
- ✅ Guardar link en base de datos
- ✅ Permitir múltiples recibos por reserva (relación Many-to-One correcta)

**El único problema es:** Puppeteer no tiene Chrome instalado, lo cual bloquea todo el flujo.

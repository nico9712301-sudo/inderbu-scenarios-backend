# Plan de Implementación: Sistema de Facturación y Recibos de Pago

## 🎯 ESTADO ACTUAL DEL PROYECTO (12/12/2025)

### ✅ COMPLETADO - FASE 1-7: BACKEND COMPLETO (100%)
- **✅ Migraciones de BD**: 5 tablas creadas y ejecutadas exitosamente
  - `templates` - Plantillas de recibos con JSON structure
  - `receipts` - Recibos generados con PDFs en R2
  - `payment_proofs` - Comprobantes subidos por usuarios
  - `notifications` - Sistema de notificaciones para admins
  - `reservations.confirmation_justification` - Campo para justificaciones
- **✅ Entidades TypeORM**: 5 entidades con relaciones correctas
- **✅ Entidades de Dominio**: Patrón Builder + validaciones de negocio
- **✅ Mappers**: Conversión bidireccional Domain ↔ TypeORM
- **✅ Repository Ports**: 5 interfaces siguiendo hexagonal architecture
  - `ITemplateRepositoryPort`, `ISubScenarioPriceRepositoryPort`, `IReceiptRepositoryPort`, `IPaymentProofRepositoryPort`, `INotificationRepositoryPort`
- **✅ Repository Adapters**: 5 implementaciones TypeORM con inyección manual
  - `TemplateRepositoryAdapter`, `SubScenarioPriceRepositoryAdapter`, `ReceiptRepositoryAdapter`, `PaymentProofRepositoryAdapter`, `NotificationRepositoryAdapter`
- **✅ Domain Services**: 3 servicios de lógica de negocio especializada
  - `PricingDomainService` - Cálculos de precios y validaciones
  - `PaymentValidationDomainService` - Validación archivos y reglas de negocio
  - `ReceiptGenerationDomainService` - Procesamiento plantillas y generación HTML
- **✅ Application Ports**: 5 interfaces de casos de uso (inbound ports)
  - `SubScenarioPricingApplicationPort`, `ReceiptManagementApplicationPort`, `PaymentProofApplicationPort`, `NotificationApplicationPort`, `TemplateManagementApplicationPort`
- **✅ Application Services**: 5 servicios de orquestación completos
  - `SubScenarioPricingApplicationService` - Gestión precios sub-escenarios
  - `ReceiptManagementApplicationService` - Generación y envío de recibos
  - `PaymentProofApplicationService` - Gestión comprobantes de pago
  - `NotificationApplicationService` - Sistema de notificaciones
  - `TemplateManagementApplicationService` - Gestión plantillas de recibos

### ✅ COMPLETADO - FASE 1-8: BACKEND 100% FUNCIONAL
- **✅ HTTP Controllers + DTOs**: 3 controladores principales con validación completa
  - `SubScenarioPricingController` - CRUD precios + cálculo de costos
  - `ReceiptController` - Generación, envío y gestión de recibos
  - `PaymentProofController` - Upload y gestión comprobantes de pago
- **✅ BillingModule**: Módulo NestJS completo con DI configuration
  - Repository providers + Application providers + Domain service providers
  - TypeORM entity configuration + Controller registration
  - Cross-module dependencies (ReservationModule, SubScenarioModule)

### 🚧 EN PROGRESO - FASE 9: FRONTEND IMPLEMENTATION
**Siguiente Tarea**: Implementar entities y repositories frontend siguiendo DDD architecture

**ALCANCE DE ESTA FASE:**
- **Frontend Domain Entities**: 5 entidades de dominio siguiendo patrones existentes
- **Frontend Repositories**: Adapters para comunicación con backend APIs
- **React Query**: Configuración de queries y mutations para billing endpoints
- **Type Safety**: DTOs frontend que coincidan con backend responses
- **Error Handling**: Manejo consistente de errores en frontend

### 📋 PRÓXIMOS PASOS INMEDIATOS:
1. **✅ AHORA**: Frontend entities + repositories + React Query setup
2. **SIGUIENTE**: Frontend use cases + application services
3. **DESPUÉS**: Atomic Design components (atoms → molecules → organisms)
4. **LUEGO**: Integration con páginas dashboard existentes
5. **FINAL**: Testing completo de scenarios Gherkin del documento

---

## Contexto del Proyecto
- **Frontend**: Next.js 15 + App Router + TypeScript + shadcn/ui + Tailwind CSS + DDD Architecture
- **Backend**: NestJS + TypeORM + MySQL + Hexagonal Architecture + Clean Architecture
- **Objetivo**: Implementar sistema completo de facturación para sub-escenarios pagados

## Arquitectura Actual Analizada

### Backend (inderbu-scenarios-backend)
- Hexagonal Architecture: `src/core/domain/`, `src/core/application/`, `src/infrastructure/`
- TypeORM sin decoradores @nestjs/typeorm (inyección manual de Repository)
- Patrón Repository + Mapper + Builder para entidades
- CloudflareR2Service existente para uploads
- Tokens DI en `src/infrastructure/tokens/`

### Frontend (inderbu-scenarios-frontend)
- DDD con Clean Architecture: `src/entities/`, `src/application/`, `src/infrastructure/`, `src/presentation/`
- Atomic Design estricto: atoms → molecules → organisms → pages
- 80+ componentes shadcn/ui disponibles
- TanStack Query configurado
- Sistema de auth con cookies httpOnly

## Implementación Paso a Paso

### FASE 1: BACKEND - Estructura de Datos y Entidades

#### 1.1 Migraciones de Base de Datos
```sql
-- Archivo: {timestamp}-CreateSubScenarioPrices.ts
CREATE TABLE inderbu.sub_scenarios_prices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fk_sub_scenario_id INT NOT NULL,
  hourly_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (fk_sub_scenario_id) REFERENCES sub_scenarios(id) ON DELETE CASCADE,
  UNIQUE KEY uk_sub_scenario_price (fk_sub_scenario_id)
);

-- Archivo: {timestamp}-CreateReceiptsTable.ts
CREATE TABLE inderbu.receipts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fk_reservation_id INT NOT NULL,
  fk_template_id INT NOT NULL,
  pdf_url VARCHAR(500) NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,
  sent_to_email VARCHAR(255) NULL,
  FOREIGN KEY (fk_reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (fk_template_id) REFERENCES templates(id)
);

-- Archivo: {timestamp}-CreatePaymentProofsTable.ts
CREATE TABLE inderbu.payment_proofs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fk_reservation_id INT NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  uploaded_by_user_id INT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fk_reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
);

-- Archivo: {timestamp}-AddJustificationToReservations.ts
ALTER TABLE inderbu.reservations
ADD COLUMN confirmation_justification TEXT NULL
COMMENT 'Justificación para confirmar sin comprobante de pago';
```

#### 1.2 Entidades TypeORM (Infrastructure)
```
src/infrastructure/persistence/entities/
├── SubScenarioPriceEntity.ts
├── ReceiptEntity.ts
└── PaymentProofEntity.ts
```

#### 1.3 Entidades de Dominio
```
src/core/domain/entities/
├── SubScenarioPriceDomainEntity.ts
├── ReceiptDomainEntity.ts
└── PaymentProofDomainEntity.ts
```

#### 1.4 Mappers
```
src/infrastructure/mappers/
├── SubScenarioPriceEntityMapper.ts
├── ReceiptEntityMapper.ts
└── PaymentProofEntityMapper.ts
```

#### 1.5 Ports de Repositorio (Domain)
```
src/core/domain/ports/outbound/
├── SubScenarioPriceRepositoryPort.ts
├── ReceiptRepositoryPort.ts
└── PaymentProofRepositoryPort.ts
```

#### 1.6 Adaptadores de Repositorio (Infrastructure)
```
src/infrastructure/adapters/outbound/repositories/
├── SubScenarioPriceRepositoryAdapter.ts
├── ReceiptRepositoryAdapter.ts
└── PaymentProofRepositoryAdapter.ts
```

### FASE 2: BACKEND - Servicios y Lógica de Negocio

#### 2.1 Servicios de Dominio
```
src/core/domain/services/
├── PricingDomainService.ts          # Lógica de precios por hora
├── ReceiptGenerationDomainService.ts # Generación de PDFs
└── PaymentValidationDomainService.ts # Validación comprobantes
```

#### 2.2 Ports de Aplicación (Inbound)
```
src/core/application/ports/inbound/
├── SubScenarioPricingApplicationPort.ts
├── ReceiptManagementApplicationPort.ts
└── PaymentProofApplicationPort.ts
```

#### 2.3 Servicios de Aplicación
```
src/core/application/services/
├── SubScenarioPricingApplicationService.ts
├── ReceiptManagementApplicationService.ts
└── PaymentProofApplicationService.ts
```

#### 2.4 DTOs
```
src/infrastructure/adapters/inbound/http/dtos/
├── sub-scenario-pricing/
│   ├── CreateSubScenarioPriceDto.ts
│   ├── UpdateSubScenarioPriceDto.ts
│   └── SubScenarioPriceResponseDto.ts
├── receipts/
│   ├── GenerateReceiptDto.ts
│   ├── SendReceiptDto.ts
│   └── ReceiptResponseDto.ts
└── payment-proofs/
    ├── UploadPaymentProofDto.ts
    └── PaymentProofResponseDto.ts
```

#### 2.5 Controladores HTTP
```
src/infrastructure/adapters/inbound/http/controllers/
├── SubScenarioPricingController.ts
├── ReceiptController.ts
└── PaymentProofController.ts
```

#### 2.6 Servicios de PDF y Email
```
src/infrastructure/adapters/outbound/
├── pdf-generation/
│   └── PdfGenerationService.ts     # Puppeteer/jsPDF para generar recibos
└── email/
    └── EmailService.ts             # Nodemailer para envío
```

### FASE 3: BACKEND - Módulos y Configuración

#### 3.1 Módulo de Facturación
```
src/infrastructure/modules/billing/
├── billing.module.ts
├── providers/
│   ├── application.providers.ts
│   ├── repository.providers.ts
│   ├── entity.providers.ts
│   └── service.providers.ts
└── controllers/
    ├── SubScenarioPricingController.ts
    ├── ReceiptController.ts
    └── PaymentProofController.ts
```

#### 3.2 Tokens DI
```
src/infrastructure/tokens/
├── BILLING_REPOSITORY_PORTS.ts
├── BILLING_APPLICATION_PORTS.ts
└── BILLING_DOMAIN_SERVICES.ts
```

#### 3.3 Actualizar Módulos Existentes
- Modificar `SubScenariosModule` para incluir precios
- Modificar `ReservationsModule` para incluir lógica de confirmación con comprobantes
- Modificar `TemplatesModule` para templates tipo "receipt"

### FASE 4: FRONTEND - Estructura de Datos y Servicios

#### 4.1 Entidades de Dominio
```
src/entities/
├── billing/
│   ├── domain/
│   │   ├── SubScenarioPriceEntity.ts
│   │   ├── ReceiptEntity.ts
│   │   └── PaymentProofEntity.ts
│   ├── infrastructure/
│   │   ├── SubScenarioPriceRepository.ts
│   │   ├── ReceiptRepository.ts
│   │   └── PaymentProofRepository.ts
│   └── api/
│       ├── billing-queries.ts
│       └── billing-mutations.ts
```

#### 4.2 Capa de Aplicación
```
src/application/billing/
├── use-cases/
│   ├── ManageSubScenarioPricingUseCase.ts
│   ├── GenerateReceiptUseCase.ts
│   ├── SendReceiptUseCase.ts
│   └── UploadPaymentProofUseCase.ts
└── services/
    └── BillingOrchestrationService.ts
```

#### 4.3 Capa de Infraestructura
```
src/infrastructure/billing/
├── repositories/
│   ├── SubScenarioPriceRepositoryAdapter.ts
│   ├── ReceiptRepositoryAdapter.ts
│   └── PaymentProofRepositoryAdapter.ts
└── web/
    └── controllers/
        ├── billing-actions.ts
        ├── receipt-actions.ts
        └── payment-proof-actions.ts
```

### FASE 5: FRONTEND - Componentes UI

#### 5.1 Componentes Atomic Design para Dashboard Sub-Escenarios
```
src/presentation/features/sub-scenarios/components/
├── atoms/
│   ├── PriceInput.tsx              # Input numérico para precios
│   ├── HasCostCheckbox.tsx         # Checkbox "Tiene costo"
│   └── CurrencyDisplay.tsx         # Mostrar precios formateados
├── molecules/
│   ├── PricingControls.tsx         # Checkbox + Input combinados
│   └── PriceFormField.tsx          # Campo completo con validación
└── organisms/
    └── SubScenariosPricingSection.tsx # Sección completa de precios en formulario
```

#### 5.2 Componentes para Reservations Dashboard
```
src/presentation/features/reservations/components/
├── atoms/
│   ├── ActionMenuButton.tsx        # Botón 3-dots
│   └── ReservationStatusBadge.tsx  # Badge de estado (actualizado)
├── molecules/
│   ├── ReservationActionMenu.tsx   # Dropdown 3-dots con opciones
│   ├── ReceiptTemplateSelector.tsx # Selector de plantillas
│   ├── EmailConfirmationDialog.tsx # Modal confirmar envío email
│   └── PaymentProofUploader.tsx    # Componente subir comprobante
└── organisms/
    ├── ReservationsTable.tsx       # Tabla actualizada con columna Acciones
    ├── ReceiptGenerationModal.tsx   # Modal generar recibo
    ├── ReceiptsHistoryModal.tsx     # Modal ver historial facturas
    ├── PaymentProofModal.tsx        # Modal ver comprobantes de pago
    └── ConfirmationWithProofModal.tsx # Modal confirmar con/sin comprobante
```

#### 5.3 Componentes para Receipt Templates (Dashboard Options)
```
src/presentation/features/receipt-templates/components/
├── atoms/
│   ├── TemplateComponent.tsx       # Componente arrastrable (Logo, Título, etc)
│   └── TemplatePreview.tsx         # Vista previa del recibo
├── molecules/
│   ├── ComponentPalette.tsx        # Paleta de componentes disponibles
│   ├── TemplateEditor.tsx          # Editor drag & drop simple
│   └── TemplatesList.tsx           # Lista de plantillas existentes
└── organisms/
    ├── ReceiptTemplateBuilder.tsx   # Builder completo drag & drop
    └── TemplatesManagement.tsx      # Gestión completa de plantillas
```

#### 5.4 Componentes para Customer Side (Mis Reservas)
```
src/presentation/features/customer-reservations/components/
├── atoms/
│   ├── UploadZone.tsx              # Zona de arrastrar archivos
│   └── PaymentWarning.tsx          # Warning 24 horas
├── molecules/
│   ├── PaymentProofSection.tsx     # Sección completa subir comprobante
│   └── ReservationPaymentStatus.tsx # Estado de pago de la reserva
└── organisms/
    └── CustomerReservationCard.tsx  # Card reserva con sección pago
```

#### 5.5 Componente NotificationBell (CREAR NUEVO)
```
src/shared/components/organisms/
├── NotificationBell.tsx            # Componente campana de notificaciones
└── NotificationDropdown.tsx        # Dropdown de notificaciones
```

### FASE 6: FRONTEND - Páginas y Routing

#### 6.1 Actualizar Dashboard Sub-Escenarios
```
src/app/dashboard/sub-scenarios/page.tsx    # Agregar lógica de precios
```

#### 6.2 Actualizar Dashboard Principal
```
src/app/dashboard/page.tsx                  # Tabla reservas con columna Acciones
```

#### 6.3 Actualizar Dashboard Options
```
src/app/dashboard/options/
├── page.tsx                               # Agregar tab "Plantillas"
└── plantillas/
    └── page.tsx                           # Página gestión plantillas recibos
```

#### 6.4 Actualizar Mis Reservas (Customer)
```
src/app/(public)/mis-reservas/page.tsx     # Agregar sección comprobantes pago
```

### FASE 7: INTEGRACIÓN Y FEATURES ESPECÍFICAS

#### 7.1 Sistema de Notificaciones
- Crear tabla `notifications` en backend
- Implementar WebSocket/Polling para notificaciones en tiempo real
- Integrar NotificationBell con nuevos comprobantes de pago

#### 7.2 Upload a Cloudflare R2
- Usar CloudflareR2Service existente con bucket "payment-receipts"
- Implementar validación archivo (.pdf, .jpg, .jpeg, .png)
- Crear hook useUploadToR2 en frontend

#### 7.3 Generación de PDFs
- Implementar PdfGenerationService con Puppeteer o jsPDF
- Templates dinámicos con variables reemplazables
- Sistema de plantillas drag-and-drop simple

#### 7.4 Envío de Emails
- Implementar EmailService con Nodemailer
- Templates de email para envío de recibos
- Log de emails enviados

### FASE 8: TESTING Y VALIDACIÓN

#### 8.1 Testing de Gherkin Scenarios
1. **Sub-scenario cost configuration** - Enable/disable cost checkbox
2. **Reservations dashboard** - 3-dot menu with correct options
3. **Receipt templates** - Drag-and-drop builder
4. **Generate receipts** - PDF generation with dynamic data
5. **Send receipts** - Email sending functionality
6. **View invoices** - History modal with download
7. **Customer upload** - Proof of payment upload
8. **Admin notifications** - New proof notification
9. **Paid reservations** - Confirmation rules with/without proof
10. **Free reservations** - No payment flow

#### 8.2 Manual Testing Checklist
- [ ] Sub-escenario cost enable/disable works
- [ ] Reservations table shows Acciones column
- [ ] 3-dot menu shows correct options (free vs paid)
- [ ] Receipt generation creates valid PDFs
- [ ] Email sending works with attachments
- [ ] Payment proof upload to R2 works
- [ ] Notifications appear in bell dropdown
- [ ] Paid reservation confirmation rules work
- [ ] Free reservations bypass payment flow

## Archivos Críticos a Modificar

### Backend
```
src/infrastructure/modules/app.module.ts                    # Importar BillingModule
src/infrastructure/entities.ts                              # Registrar nuevas entidades
src/infrastructure/persistence/entities/ReservationEntity.ts # Agregar confirmation_justification
src/infrastructure/persistence/entities/SubScenarioEntity.ts # Relación con precios
```

### Frontend
```
src/shared/components/organisms/NotificationBell.tsx        # CREAR - Componente campana
src/presentation/features/reservations/components/organisms/ReservationsTable.tsx # Modificar tabla
src/app/dashboard/sub-scenarios/page.tsx                    # Agregar lógica precios
src/app/dashboard/options/page.tsx                          # Agregar tab Plantillas
src/app/(public)/mis-reservas/page.tsx                      # Agregar upload comprobantes
```

## Orden de Implementación Sugerido

1. **Migraciones de BD** - Crear todas las tablas necesarias
2. **Entidades Backend** - TypeORM entities + Domain entities + Mappers
3. **Repositorios Backend** - Ports + Adapters para data access
4. **Servicios Backend** - Domain services + Application services
5. **Controladores Backend** - HTTP endpoints para APIs
6. **Módulo Backend** - BillingModule con providers y DI
7. **Entidades Frontend** - Domain entities + Repositories
8. **Servicios Frontend** - Use cases + Application services
9. **Componentes Base** - Atoms y molecules
10. **Componentes Complejos** - Organisms y pages
11. **Integración UI** - Modificar páginas existentes
12. **Features Especiales** - NotificationBell, R2 upload, PDF generation
13. **Testing** - Validar todos los scenarios de Gherkin

## Notas Importantes
- **NO usar @nestjs/typeorm** - Inyección manual de Repository
- **Seguir Atomic Design** estrictamente
- **Usar componentes shadcn/ui** existentes
- **Mantener patrones DDD** en ambos proyectos
- **Validar cada scenario Gherkin** meticulosamente
- **Usar CloudflareR2Service** existente para uploads
- **Mantener consistencia** en naming y arquitectura
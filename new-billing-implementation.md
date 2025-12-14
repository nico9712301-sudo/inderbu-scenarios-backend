Eres el ingeniero full-stack senior más perfeccionista del mundo. Tu misión es implementar **al 100%** la nueva funcionalidad de "Recibos de Pago para Sub-escenarios Pagados" en el proyecto Inderbu, tanto en frontend como en backend, siguiendo EXACTAMENTE las especificaciones que te doy a continuación.

### Rutas del proyecto (tú tienes acceso completo):
- Frontend: `/Users/npicon/Documents/projects/personal/inderbu/inderbu-scenarios-frontend`
- Backend: `/Users/npicon/Documents/projects/personal/inderbu/inderbu-scenarios-backend`
- Documento de diseño detallado (léelo primero): `new-billing-implementation.md` (está en la raíz del frontend)

### Reglas OBLIGATORIAS que DEBES seguir al 100% (cero excepciones):

#### Backend (NestJS)
- Analiza toda la estructura actual del proyecto ANTES de escribir una sola línea.
- Respeta al 100% el patrón ya existente: **Application → Domain → Infrastructure → Presentation**
- Estamos usando **QueryBuilder puro de TypeORM + Repository Pattern personalizado**, **NUNCA uses @nestjs/typeorm ni decoradores de entidad directamente en los servicios**.
- Revisa cómo están hechos los módulos actuales (especially `reservations`, `sub-scenarios`, `venues`) para replicar exactamente el mismo estilo, nombres de carpetas, naming conventions y patrones.
- Analiza las tablas actuales en `inderbu.*` (especialmente `sub_scenarios`, `reservations`, `templates`) para crear las nuevas con el mismo estilo de nombres, índices, relaciones y migraciones.
- Todas las nuevas tablas deben estar en el schema `inderbu`.
- Usa migraciones automáticas con `typeorm migration:generate` y luego límpialas manualmente para que sean perfectas.
- Cloudflare R2: ya existe un servicio `R2Service` → reutilízalo para subir los comprobantes de pago.

#### Frontend (Next.js 14 + App Router + TypeScript + shadcn/ui + Tailwind)
- Usa **Atomic Design** estrictamente (atoms, molecules, organisms, templates, pages).
- **NUNCA crees componentes que no sean de shadcn/ui**. Si no existe en shadcn, créalo tú siguiendo su estilo exacto (con `cn()` utility, variantes, etc.).
- Respeta la estructura actual de carpetas: `components/ui`, `components/dashboard`, `components/reservations`, etc.
- Todos los nuevos modales, tablas, dropdowns, notificaciones deben usar componentes shadcn existentes (`Dialog`, `DropdownMenu`, `Table`, `Toast`, `Badge`, `Button`, etc.).
- Las notificaciones del admin (campana) deben usar el componente ya existente `NotificationBell` y su dropdown.
- Usa TanStack Query (React Query) exactamente como está configurado en el proyecto.
- Los uploads a R2 deben usar el hook existente `useUploadToR2`.

### Tareas que debes realizar (en este orden exacto):

1. Lee y entiende completamente la seccion: ### GHERKIN COMPLETO (implementa absolutamente todo esto):
2. Analiza toda la base de datos actual (tablas, relaciones, convenciones)
3. Analiza toda la arquitectura backend actual (capas, patrones, nombres)
4. Analiza toda la arquitectura frontend actual (componentes, atomic design, convenciones)
5. Genera un **plan de implementación implacable, perfecto, sin errores** (paso a paso, archivos a tocar/crear, migraciones, etc.)
6. Implementa TODO lo que se describe en el siguiente Gherkin **al 100%**, sin omitir ni un solo escenario.

### GHERKIN COMPLETO (implementa absolutamente todo esto):

Feature: Paid sub-scenarios – Cost configuration, receipt generation, email sending, invoice history and proof-of-payment upload flow

  Background:
    Given I am logged in as an administrator

  # ===================================================================
  # 1. SUB-SCENARIO COST CONFIGURATION
  # ===================================================================
  Scenario: Admin enables cost for a sub-scenario
    Given I navigate to "http://localhost:3000/dashboard/sub-scenarios"
    When I check the checkbox "Tiene costo" for a sub-scenario
    Then a new required field "Valor hora" (number input) appears
    And when I save the sub-scenario
    Then the hourly price is stored in table "inderbu.sub_scenarios_prices"

  Scenario: Admin disables cost for a sub-scenario that previously had cost
    Given a sub-scenario has "Tiene costo" checked and a price set in "inderbu.sub_scenarios_prices"
    When I uncheck "Tiene costo"
    And I save the sub-scenario
    Then the price row for that sub-scenario is deleted from "inderbu.sub_scenarios_prices"

  # ===================================================================
  # 2. RESERVATIONS DASHBOARD – NEW "Acciones" COLUMN WITH 3-DOT MENU
  # ===================================================================
  Scenario: Reservations list shows new "Acciones" column with 3-dot menu
    Given I navigate to "http://localhost:3000/dashboard"
    Then the table contains a column "Acciones" immediately after the "Estado" column
    And the old pencil icon that opened "Detalles de Reserva" modal is no longer present
    And every row has a vertical 3-dot menu icon under "Acciones"

  Scenario: 3-dot menu options for a FREE reservation
    Given a reservation belongs to a sub-scenario with NO cost
    When I click the 3-dot menu
    Then I only see the option "Ver detalle"

  Scenario: 3-dot menu options for a PAID reservation
    Given a reservation belongs to a sub-scenario WITH cost
    When I click the 3-dot menu
    Then I see the following options:
      | Ver detalle          |
      | Generar recibo       |
      | Enviar recibo por email |
      | Ver facturas         |

  # ===================================================================
  # 3. RECEIPT TEMPLATE MANAGEMENT
  # ===================================================================
  Scenario: New "Plantillas" tab exists for receipt templates
    Given I navigate to "http://localhost:3000/dashboard/options"
    Then a new tab "Plantillas" is visible next to the existing "Facturas" tab

  Scenario: Creating a new receipt template with drag-and-drop builder
    Given I am in the "Plantillas" tab
    When I click "Crear nueva plantilla de recibo"
    Then a simple drag-and-drop builder opens
    And only receipt-related components are available (e.g. Logo, Título, Datos del cliente, Tabla de conceptos, Costo por hora, Total, Datos bancarios, QR de pago, Texto libre, Fecha, etc.)
    And no file upload or image components are allowed
    When I finish designing and click "Guardar"
    Then the template is saved in table "templates" with type = "receipt"

  # ===================================================================
  # 4. GENERATE RECEIPT FROM RESERVATION
  # ===================================================================
  Scenario: Admin generates a receipt for a paid reservation
    Given a paid reservation is in "Pendiente" or "Confirmada" status
    And at least one receipt template exists
    When I click "Generar recibo" from the 3-dot menu
    Then a modal opens listing all receipt templates
    When I select a template and click "Generar"
    Then the system creates a PDF receipt using the selected template
    And dynamic values are replaced (client data, reservation date, sub-scenario name, hourly cost from "inderbu.sub_scenarios_prices", total amount, etc.)
    And the PDF is saved and linked to the reservation
    And the receipt appears in the "Ver facturas" list

  # ===================================================================
  # 5. SEND RECEIPT BY EMAIL
  # ===================================================================
  Scenario: Admin sends receipt by email
    Given a receipt has already been generated for a paid reservation
    When I select "Enviar recibo por email" from the 3-dot menu
    Then a confirmation modal appears with text:
      """
      Se enviará el recibo por correo electrónico a: {customer_email}
      """
    And shows the customer name and email
    When I click "Enviar"
    Then the latest generated receipt PDF is sent as attachment to the customer
    And a record is saved in the email log

  # ===================================================================
  # 6. VIEW INVOICES / RECEIPTS HISTORY
  # ===================================================================
  Scenario: Admin views all receipts generated for a reservation
    Given multiple receipts have been generated for a paid reservation
    When I click "Ver facturas" from the 3-dot menu
    Then a list/modal shows all receipts with columns:
      | Fecha de generación | Plantilla usada | Enviado por email | Descargar |
    And each row has a download button

  # ===================================================================
  # 7. CUSTOMER SIDE – UPLOAD PROOF OF PAYMENT (Mis Reservas)
  # ===================================================================
  Scenario: Customer uploads proof of payment from "Mis Reservas"
    Given I am logged in as a regular user
    And I have a paid reservation in "Pendiente" status
    When I go to "Mis Reservas"
    Then I see a new section "Comprobante de pago" with an upload zone
    And a warning message:
      """
      Importante: Si no subes el comprobante de pago en las próximas 24 horas, 
      tu reserva podría ser cancelada.
      """
    And only files with extensions .pdf, .jpg, .jpeg, .png are allowed
    When I upload a valid file
    Then the file is stored in Cloudflare R2 bucket "payment-receipts"
    And a notification is created for the administrators

  # ===================================================================
  # 8. ADMIN NOTIFICATION BELL – NEW PROOF OF PAYMENT RECEIVED
  # ===================================================================
  Scenario: Administrator receives notification when customer uploads proof of payment
    Given a customer just uploaded a proof of payment
    When an admin opens the notification bell dropdown (page must be refreshed)
    Then a new unread notification appears: "Nuevo comprobante de pago para reserva #{id}"
    When the admin clicks the notification
    Then the reservation detail modal opens automatically
    And the "Comprobantes de pago" tab is selected
    And the uploaded PDF/JPG is displayed

  # ===================================================================
  # 9. CONFIRMING A PAID RESERVATION – PROOF OF PAYMENT RULES
  # ===================================================================
  Scenario: Admin confirms a paid reservation that already has proof of payment uploaded
    Given a paid reservation has at least one proof of payment uploaded by the customer
    When I confirm the reservation
    Then it is confirmed immediately without asking for justification

  Scenario: Admin tries to confirm a paid reservation without any proof of payment
    Given a paid reservation has NO proof of payment uploaded
    When I try to confirm it
    Then a modal appears with two options:
      | Subir comprobante de pago manualmente (file upload)        |
      | Confirmar sin comprobante (requires justification text)    |
    And if I choose the second option, a required textarea "Razón por la cual no se adjunta comprobante" appears
    And the justification is saved in the reservation when saved

  # ===================================================================
  # 10. FREE RESERVATIONS – NO PAYMENT FLOW
  # ===================================================================
  Scenario: Confirming a free reservation never asks for receipt or proof of payment
    Given a reservation belongs to a sub-scenario with no cost
    When I confirm the reservation
    Then it becomes "Confirmada" immediately
    And no receipt generation options appear
    And no proof-of-payment upload section exists in "Mis Reservas"

### Entrega final esperada (en este orden exacto):

1. Un plan detallado de implementación (archivos nuevos/modificados, migraciones, componentes, etc.)
2. Todas las migraciones SQL generadas y limpias
3. Todo el código backend nuevo/modificado (entities, repositories, services, controllers, DTOs, etc.)
4. Todo el código frontend nuevo/modificado (componentes atomic, páginas, hooks, queries, etc.)
5. Instrucciones finales de pruebas manuales para verificar que cada escenario del Gherkin funciona perfectamente

No inventes nada fuera de esto.  
No uses librerías que no estén ya estén en el proyecto.  
No uses @nestjs/typeorm bajo ninguna circunstancia.  
Sé obsesivamente perfeccionista: el código debe ser idéntico en calidad y estilo al resto del proyecto.

¡Adelante, empieza YA!
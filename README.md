# 🏟️ Inderbu Scenarios Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <strong>Sistema de gestión de escenarios deportivos y reservas</strong><br>
  Plataforma backend robusta construida con NestJS siguiendo arquitectura hexagonal
</p>

<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<img src="https://img.shields.io/badge/TypeScript-5.7.3-blue?logo=typescript" alt="TypeScript">
<img src="https://img.shields.io/badge/MySQL-8.0+-orange?logo=mysql" alt="MySQL">
<img src="https://img.shields.io/badge/Redis-7.0+-red?logo=redis" alt="Redis">
</p>

## 🎯 **Descripción del Proyecto**

**Inderbu Scenarios Backend** es una API REST completa para la gestión de escenarios deportivos, reservas y disponibilidad de espacios. El sistema permite crear, administrar y reservar sub-escenarios dentro de complejos deportivos con funcionalidades avanzadas como:

- **Gestión completa de escenarios**: Administración de espacios deportivos con ubicación geográfica
- **Sistema de reservas flexible**: Soporta reservas simples y por rangos de fechas con días específicos
- **Control de disponibilidad**: Algoritmos inteligentes para consultar disponibilidad en tiempo real
- **Autenticación JWT**: Sistema seguro de autenticación y autorización basado en roles
- **Arquitectura escalable**: Diseño hexagonal con clara separación de responsabilidades

## 🏗️ **Arquitectura del Sistema**

### **Arquitectura Hexagonal (Ports & Adapters)**

```
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                     │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   HTTP/REST     │    │   PERSISTENCE   │                │
│  │   Controllers   │    │   TypeORM       │                │
│  │   DTOs & Auth   │    │   MySQL/Redis   │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                        │                        │
└───────────┼────────────────────────┼────────────────────────┘
            │                        │
            ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 CORE APPLICATION LAYER                      │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  USE CASES &    │    │    DOMAIN       │                │
│  │   SERVICES      │    │   ENTITIES      │                │
│  │  (Application)  │    │   & LOGIC       │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### **Componentes Principales**

#### 🎯 **Core Domain** (`src/core/domain/`)
- **Entidades de Dominio**: `Scenario`, `SubScenario`, `Reservation`, `User`, etc.
- **Servicios de Dominio**: Lógica de negocio pura
- **Puertos**: Interfaces para la comunicación entre capas
- **Enums**: Estados de reservas, tipos, etc.

#### ⚙️ **Application Layer** (`src/core/application/`)
- **Casos de Uso**: Orquestación de la lógica de negocio
- **Puertos de Entrada**: Interfaces para controladores
- **Servicios de Aplicación**: Coordinación entre dominio e infraestructura

#### 🔧 **Infrastructure Layer** (`src/infrastructure/`)
- **Adaptadores de Entrada**: Controladores HTTP, DTOs, Swagger
- **Adaptadores de Salida**: Repositorios, servicios de email, almacenamiento
- **Persistencia**: Entidades TypeORM y configuración de BD
- **Providers**: Configuración de inyección de dependencias

## 🚀 **Funcionalidades Principales**

### ⭐ **Sistema de Reservas Avanzado**

#### **Tipos de Reservas Soportadas:**
- **🗓️ Reservas Simples**: Para un día específico
- **Reservas por Rango**: Con fechas inicial y final
- ** Reservas Recurrentes**: Con días específicos de la semana

#### **Casos de Uso Reales:**
```http
# Reserva de un solo día
GET /api/reservations/availability?subScenarioId=16&initialDate=2025-06-15

# Reserva de rango completo  
GET /api/reservations/availability?subScenarioId=16&initialDate=2025-06-10&finalDate=2025-06-20

# Solo lunes, miércoles y viernes
GET /api/reservations/availability?subScenarioId=16&initialDate=2025-06-10&finalDate=2025-06-20&weekdays=1,3,5

# Solo fines de semana
GET /api/reservations/availability?subScenarioId=16&initialDate=2025-06-10&finalDate=2025-06-20&weekdays=0,6
```

### 🔐 **Sistema de Autenticación Completo**
- **JWT tokens** con refresh tokens
- **Autenticación basada en roles**: Admin, Manager, User
- **Guards de protección** para endpoints sensibles
- **Hash seguro de contraseñas** con bcrypt

### 🗄️ **Gestión de Datos Geográficos**
```
Ciudad → Comuna → Barrio → Escenario → Sub-Escenario
```

### 📊 **Sistema de Seeding Robusto**
- **Datos de prueba completos** con JSON estructurados
- **CLI integrado** para inicialización de datos
- **Seeders por entidad** con dependencias resueltas automáticamente

## 🛠️ **Stack Tecnológico Completo**

### **Backend Framework**
- ![NestJS](https://img.shields.io/badge/NestJS-11.0.1-ea2845?logo=nestjs) **Framework principal**
- ![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?logo=typescript) **Lenguaje de desarrollo**
- ![Node.js](https://img.shields.io/badge/Node.js-LTS-green?logo=node.js) **Runtime environment**

### **Base de Datos y ORM**
- ![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange?logo=mysql) **Base de datos principal**
- ![TypeORM](https://img.shields.io/badge/TypeORM-0.3.22-red) **ORM y migraciones**
- ![Redis](https://img.shields.io/badge/Redis-5.6+-red?logo=redis) **Cache y sesiones**

### **Autenticación y Seguridad**
- ![JWT](https://img.shields.io/badge/JWT-9.0.2-black) **JSON Web Tokens**
- ![Passport](https://img.shields.io/badge/Passport-4.0.1-green) **Estrategias de autenticación**
- ![bcrypt](https://img.shields.io/badge/bcrypt-5.1.1-yellow) **Hash de contraseñas**

### **Validación y Documentación**
- ![Class Validator](https://img.shields.io/badge/class--validator-0.14.1-blue) **Validación de DTOs**
- ![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-green) **Documentación automática**
- ![Class Transformer](https://img.shields.io/badge/class--transformer-0.5.1-purple) **Serialización**

### **Herramientas de Desarrollo**
- ![ESLint](https://img.shields.io/badge/ESLint-9.18.0-purple) **Linting**
- ![Prettier](https://img.shields.io/badge/Prettier-3.4.2-yellow) **Formateo de código**
- ![Jest](https://img.shields.io/badge/Jest-29.7.0-red) **Testing framework**

## 🚀 **Inicio Rápido**

### **📋 Prerrequisitos**
- **Node.js** 18+ LTS
- **MySQL** 8.0+
- **Redis** 6.0+ (opcional, para cache)
- **pnpm** (gestor de paquetes recomendado)

### **⚡ Configuración Rápida con Docker**

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd inderbu-scenarios-backend

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 3. Levantar servicios con Docker
docker run -d \
  --name mysql-container \
  --env-file .env.mysql \
  -p 3306:3306 \
  mysql:8.0

docker run -d \
  --name redis-container \
  --env-file .env.redis \
  -p 6379:6379 \
  redis:7-alpine

# 4. Instalar dependencias
pnpm install

# 5. Sembrar base de datos (opcional)
pnpm run start:seeds

# 6. Iniciar en modo desarrollo
pnpm run start:dev
```

### **🔧 Configuración Manual Detallada**

#### **1. Variables de Entorno**
```bash
# .env - Configuración mínima requerida
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=inderbu_scenarios
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:3000
```

#### **2. Base de Datos**
```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE inderbu_scenarios CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Las tablas se crean automáticamente con TypeORM
```

#### **3. Inicialización con Datos**
```bash
# Sembrar datos básicos del sistema
pnpm run start:seeds

# Esto creará:
# ✅ Roles de usuario (Admin, Manager, User)
# ✅ Estados de reserva (Pendiente, Confirmada, Cancelada)
# ✅ Ciudades, comunas y barrios de ejemplo
# ✅ Tipos de superficies y áreas de actividad
# ✅ Escenarios y sub-escenarios de prueba
# ✅ Horarios disponibles
# ✅ Usuarios de prueba
```

## 🎮 **Guía de Uso de la API**

### **🔐 Autenticación**

#### **Registro e Inicio de Sesión**
```bash
# Registrar nuevo usuario
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123",
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "3001234567"
  }'

# Iniciar sesión
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }'

# Respuesta:
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "usuario@ejemplo.com",
      "firstName": "Juan",
      "lastName": "Pérez"
    }
  }
}
```

### **🏟️ Gestión de Escenarios**

#### **Listar Escenarios con Paginación**
```bash
# Obtener escenarios paginados
curl "http://localhost:3001/scenarios?page=1&limit=10&search=futbol"

# Con filtros específicos
curl "http://localhost:3001/scenarios?page=1&limit=10&neighborhoodId=5&active=true"
```

#### **Crear Nuevo Escenario**
```bash
curl -X POST http://localhost:3001/scenarios \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Complejo Deportivo Central",
    "address": "Calle 123 #45-67",
    "neighborhoodId": 1,
    "isActive": true
  }'
```

### **🏃 Sub-Escenarios y Configuración**

#### **Crear Sub-Escenario**
```bash
curl -X POST http://localhost:3001/sub-scenarios \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cancha de Fútbol #1",
    "scenarioId": 1,
    "activityAreaId": 1,
    "fieldSurfaceTypeId": 2,
    "state": true,
    "hasCost": true,
    "numberOfPlayers": 22,
    "numberOfSpectators": 100,
    "recommendations": "Usar zapatos con tapones de goma"
  }'
```

### **Sistema de Reservas Completo**

#### **Consultar Disponibilidad (Múltiples Escenarios)**

```bash
# Caso 1: Un solo día
curl "http://localhost:3001/reservations/availability?subScenarioId=16&initialDate=2025-06-15"

# Caso 2: Rango completo de fechas
curl "http://localhost:3001/reservations/availability?subScenarioId=16&initialDate=2025-06-10&finalDate=2025-06-20"

# Caso 3: Solo lunes, miércoles y viernes
curl "http://localhost:3001/reservations/availability?subScenarioId=16&initialDate=2025-06-10&finalDate=2025-06-20&weekdays=1,3,5"

# Caso 4: Solo fines de semana
curl "http://localhost:3001/reservations/availability?subScenarioId=16&initialDate=2025-06-10&finalDate=2025-06-20&weekdays=0,6"
```

#### **Crear Reservas Flexibles**

```bash
# 🗓️ Reserva simple (un día)
curl -X POST http://localhost:3001/reservations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subScenarioId": 16,
    "type": "SINGLE",
    "initialDate": "2025-06-15",
    "timeSlotIds": [1, 2, 3],
    "comments": "Partido de práctica del equipo"
  }'

# Reserva por rango con días específicos
curl -X POST http://localhost:3001/reservations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subScenarioId": 16,
    "type": "RANGE",
    "initialDate": "2025-06-10",
    "finalDate": "2025-06-20",
    "weekDays": [1, 3, 5],
    "timeSlotIds": [1, 2],
    "comments": "Entrenamientos semanales del equipo"
  }'
```

#### **Gestión de Estados de Reserva**
```bash
# Cambiar estado de reserva
curl -X PATCH http://localhost:3001/reservations/123/state \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reservationStateId": 2
  }'

# Estados disponibles:
# 1 = PENDIENTE
# 2 = CONFIRMADA  
# 3 = CANCELADA
```

### **👥 Gestión de Usuarios y Roles**

```bash
# Listar usuarios con paginación
curl "http://localhost:3001/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Obtener perfil del usuario autenticado
curl "http://localhost:3001/auth/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Actualizar perfil
curl -X PUT http://localhost:3001/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan Carlos",
    "lastName": "Pérez Rodríguez",
    "phone": "3001234567"
  }'
```

## 🧪 **Testing y Calidad de Código**

### **Comandos de Testing**
```bash
# Tests unitarios
pnpm run test

# Tests en modo watch
pnpm run test:watch

# Coverage completo
pnpm run test:cov

# Tests e2e (end-to-end)
pnpm run test:e2e
```

### **Calidad de Código**
```bash
# Linting con ESLint
pnpm run lint

# Formateo con Prettier
pnpm run format

# Verificar ambos
pnpm run lint && pnpm run format
```

### **Comandos CLI Personalizados**
```bash
# Ejecutar cualquier comando CLI personalizado
pnpm run cli

# Sembrar base de datos completa
pnpm run start:seeds

# Ejemplo de uso del CLI
pnpm run cli -- seed:users  # Sembrar solo usuarios
pnpm run cli -- seed:all    # Sembrar todo
```

## 📊 **Documentación API Interactiva**

Una vez que el servidor esté ejecutándose, puedes acceder a la documentación interactiva:

### **🌐 Swagger UI**
- **URL Principal**: http://localhost:3001/api
- **URL Alternativa**: http://localhost:3001/api-docs

### **Características de la Documentación:**
- ✅ **Esquemas completos** de request/response
- ✅ **Autenticación JWT integrada**
- ✅ **Ejemplos de uso** para cada endpoint  
- ✅ **Pruebas en vivo** desde la interfaz
- ✅ **Modelos de datos** con validaciones

## 📁 **Estructura del Proyecto Detallada**

```
src/
├── 🎯 core/                          # CAPA DE DOMINIO Y APLICACIÓN
│   ├── domain/                       # Lógica de dominio pura
│   │   ├── entities/                 # Entidades de dominio
│   │   │   ├── reservation.domain-entity.ts
│   │   │   ├── scenario.domain-entity.ts
│   │   │   ├── sub-scenario.domain-entity.ts
│   │   │   └── user.domain-entity.ts
│   │   ├── enums/                    # Enumeraciones del dominio
│   │   ├── ports/                    # Contratos/interfaces
│   │   └── services/                 # Servicios de dominio
│   └── application/                  # Casos de uso
│       ├── ports/                    # Puertos de aplicación
│       ├── services/                 # Servicios de aplicación
│       └── tokens/                   # Tokens de inyección
│
├── 🔧 infrastructure/                # CAPA DE INFRAESTRUCTURA
│   ├── adapters/                     # Implementación de puertos
│   │   ├── inbound/                  # Adaptadores de entrada
│   │   │   └── http/                 # Controllers, DTOs, Guards
│   │   │       ├── controllers/      # Controladores REST
│   │   │       ├── dtos/            # Data Transfer Objects
│   │   │       └── strategies/       # Estrategias de auth
│   │   └── outbound/                # Adaptadores de salida
│   │       ├── repositories/        # Implementaciones de repos
│   │       ├── email/               # Servicio de email
│   │       └── file-storage/        # Almacenamiento de archivos
│   ├── persistence/                 # Entidades de TypeORM
│   ├── modules/                     # Módulos de NestJS
│   ├── providers/                   # Providers de DI
│   └── config/                      # Configuraciones
│
├── 📄 cli.ts                        # CLI para seeders y comandos
└── 🚀 main.ts                       # Punto de entrada de la app
```

## 📚 **Documentación Técnica Completa**

### 🏛️ **Guías de Configuración**

La carpeta `docs/` contiene documentación detallada para la configuración del entorno:

- **[📊 Configuración de Base de Datos con Docker](docs/HOW_TO_SETUP_YOUR_DATABASE_WITH_DOCKER.md)**
  - Setup completo de MySQL con Docker
  - Variables de entorno y configuración
  - Comandos para gestión del container

- **[⚡ Configuración de Redis con Docker](docs/HOW_TO_SETUP_YOUR_REDIS_WITH_DOCKER.md)**
  - Instalación de Redis para cache y sesiones
  - Configuración con y sin autenticación
  - Comandos útiles para desarrollo y producción

- **[📋 Documentación de Reservaciones](docs/RESERVATIONS.md)**
  - Casos de uso completos del sistema de reservas
  - Ejemplos de consultas de disponibilidad
  - Parámetros avanzados para filtros

### 🔧 **Patrones y Principios Implementados**

#### **🏗️ Arquitectura Hexagonal (Ports & Adapters)**
- **Separación clara** entre lógica de negocio e infraestructura
- **Testabilidad** mejorada con puertos e interfaces
- **Flexibilidad** para cambiar implementaciones sin afectar el dominio

#### **🎯 Domain-Driven Design (DDD)**
- **Entidades ricas** con lógica de negocio
- **Value Objects** para conceptos del dominio
- **Servicios de dominio** para lógica compleja
- **Builders pattern** para construcción de entidades

#### ** CQRS Básico**
- **Separación** entre comandos y consultas
- **DTOs específicos** para entrada y salida
- **Mappers** para transformación de datos

#### **💉 Inyección de Dependencias**
- **Puertos e implementaciones** desacopladas
- **Tokens de inyección** centralizados
- **Providers configurables** por entorno

## 🔒 **Seguridad y Mejores Prácticas**

### **Características de Seguridad Implementadas**
- ✅ **Hashing seguro** de contraseñas con bcrypt
- ✅ **JWT tokens** con expiración configurable
- ✅ **Refresh tokens** para sesiones extendidas
- ✅ **Validación robusta** de datos de entrada
- ✅ **Guards de autorización** por roles
- ✅ **Sanitización** de inputs para prevenir XSS
- ✅ **Rate limiting** (configurable)
- ✅ **CORS** configurado correctamente

### **🔐 Variables de Entorno Críticas**
```bash
#   OBLIGATORIAS para producción
JWT_SECRET=tu_clave_jwt_super_secreta_aqui_min_32_chars
DB_PASSWORD=contraseña_base_datos_segura
SEED_USER_PASSWORD=contraseña_usuarios_prueba

# Configuración de email (opcional para desarrollo)
ETHEREAL_USER=tu_usuario_ethereal@ethereal.email
ETHEREAL_PASS=tu_contraseña_ethereal
```

## 🐛 **Troubleshooting y Solución de Problemas**

### **Problemas Comunes y Soluciones**

#### **🔌 Error de Conexión a Base de Datos**
```bash
# Verificar que MySQL esté corriendo
docker ps | grep mysql

# Verificar conexión
mysql -h localhost -u tu_usuario -p

# Recrear container si es necesario
docker rm -f mysql-container
docker run -d --name mysql-container --env-file .env.mysql -p 3306:3306 mysql:8.0
```

#### **🔑 Error de Autenticación JWT**
```bash
# Verificar que JWT_SECRET esté configurado
echo $JWT_SECRET

# Regenerar token seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### **📊 Error en Seeding de Datos**
```bash
# Limpiar y resetear base de datos
pnpm run cli -- db:reset

# Volver a sembrar solo datos básicos
pnpm run start:seeds

# Verificar logs detallados
DEBUG=* pnpm run start:seeds
```

#### **🔍 Error de Módulos o Dependencias**
```bash
# Limpiar cache y reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Verificar versiones
node --version  # Debe ser 18+
pnpm --version
```

## 🤝 **Contribución y Desarrollo**

### **📋 Guía de Contribución**

#### ** Flujo de Trabajo**
1. **Fork** del repositorio
2. **Crear rama** feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Desarrollar** siguiendo las convenciones del proyecto
4. **Testing** completo (`pnpm run test && pnpm run test:e2e`)
5. **Commit** con mensaje descriptivo
6. **Push** y crear **Pull Request**

#### **📏 Estándares de Código**
```bash
# Antes de hacer commit, siempre ejecutar:
pnpm run lint      # Verificar estilo de código
pnpm run format    # Formatear automáticamente
pnpm run test      # Ejecutar tests unitarios
pnpm run build     # Verificar que compile correctamente
```

#### **📝 Convenciones de Commits**
```bash
feat(reservations): add support for recurring bookings
fix(auth): resolve JWT token expiration issue  
docs(readme): update API documentation
test(scenarios): add unit tests for scenario service
refactor(core): improve domain entity builders
```

## 📞 **Soporte y Contacto**

### **🆘 Obtener Ayuda**
- **Issues**: Reporta bugs o solicita features en GitHub Issues
- **📖 Documentación**: Revisa la documentación técnica en `/docs`
- **🔍 Swagger**: Consulta la API interactiva en `/api-docs`

### **👨‍💻 Información del Desarrollo**
- **Desarrollador Principal**: Nicolás Picón Jaimes
- **Arquitectura**: Hexagonal con DDD y CQRS
- **Estilo de Código**: TypeScript estricto con ESLint + Prettier
- **Testing**: Jest con coverage mínimo del 80%

---

## 📄 **Licencia y Uso**

Este proyecto es parte de un desarrollo académico y profesional. 

**🏗️ Construido con ❤️ usando NestJS, TypeScript y arquitectura hexagonal**

---

<p align="center">
  <strong>¿Encontraste útil este proyecto? ⭐ Dale una estrella en GitHub</strong>
</p>

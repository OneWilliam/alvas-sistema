# Alvas-Sistema - Arquitectura Actual del Backend

Este documento describe el estado real del backend en `apps/api/src/lib`.
## Criterio de lectura

- `Puertos primarios`: puntos de entrada al contexto. En este backend se materializan como routers/controladores HTTP y los casos de uso que orquestan la aplicacion.
- `Puertos secundarios`: interfaces que el dominio o la aplicacion necesitan para hablar con afuera.
- `Adaptadores secundarios`: implementaciones concretas de esos puertos.
- `Comunicacion entre modulos`: solo mediante puertos, claims de sesion compartidos o adaptadores explicitos.

## Bounded Contexts

### `shared`

Responsabilidad:
- Tipos base, errores transversales, contratos genericos, persistencia compartida, generacion de ids y sesion tecnica.

Casos de uso:
- `CasoDeUso`
- `Resultado`

DTOs:
- No aplica como modulo de negocio.

Entidades:
- No aplica.

Value objects y tipos:
- `IdUsuarioRef`
- `Roles`
- `Marca`
- `Nulo`
- `Primitivo`

Puertos secundarios:
- `IGeneradorId`
- `IReloj`
- `IRepositorioLectura`
- `IRepositorioEscritura`

Puertos primarios:
- `SessionClaims`
- `verifySessionMiddleware`
- `requireRolesMiddleware`

Adaptadores secundarios:
- `UuidGeneradorId`
- `drizzle`
- `D1DatabaseLike`

### `auth`

Responsabilidad:
- Credenciales, login, refresh, tokens y sesion autenticada.
- No es dueno de permisos de negocio de otros modulos.

Casos de uso:
- `IniciarSesionUseCase`
- `RenovarSesionUseCase`

DTOs:
- `SesionAutenticadaDTO`

Entidades:
- `Sesion`

Value objects:
- `AuthToken`
- `RefreshToken`
- `RolAcceso`

Puertos secundarios:
- `IConsultaCredencialesUsuario`
- `IVerificadorDeClave`
- `ITokenProvider`

Puertos primarios:
- Router HTTP: `crearAuthRouter`
- Controller HTTP: `AuthController`
- Endpoints:
  - `POST /auth/login`
  - `POST /auth/refresh`

Adaptadores secundarios:
- `HmacTokenProvider`
- `TokenProviderFactory`

Notas:
- `auth` no importa `usuarios/domain`.
- Login usa `username + clave`.
- Los claims de sesion viven en `shared/infrastructure/session`, no en `auth`.

### `usuarios`

Responsabilidad:
- Gestion del usuario interno del sistema.
- Dueño de la identidad interna: `id`, `username`, `nombre`, `rol`, `estado`, `hashClave`.

Casos de uso:
- `CrearUsuarioUseCase`
- `ListarUsuariosUseCase`
- `ObtenerUsuarioUseCase`
- `ActualizarUsuarioUseCase`

DTOs:
- `CrearUsuarioDTO`
- `UsuarioRespuestaDTO`
- `UsuarioOutputDTO`
- `ActualizarUsuarioInputDTO`
- `UsuarioListadoOutputDTO`

Entidades:
- `Usuario`

Value objects:
- `IdUsuario`
- `Username`
- `Nombre`
- `HashClave`
- `Rol`
- `EstadoUsuario`

Puertos secundarios:
- `IUsuarioRepository`
- `IPasswordHasher`

Puertos primarios:
- Router HTTP: `crearUsuarioRouter`
- Controller HTTP: `UsuarioController`
- Endpoints:
  - `GET /usuarios`
  - `POST /usuarios`
  - `GET /usuarios/:idUsuario`
  - `PUT /usuarios/:idUsuario`

Adaptadores secundarios:
- `D1UsuarioRepository`
- `UsuarioMapper`
- `Pbkdf2PasswordHasher`

Adaptadores de integracion saliente:
- `ConsultaCredencialesUsuarioAdapter`
  - expone a `auth` el puerto `IConsultaCredencialesUsuario`
- `VerificadorDeClavePbkdf2Adapter`
  - implementa para `auth` el puerto `IVerificadorDeClave`

Persistencia:
- Tabla `usuarios`
- Columna nueva: `username`
- Migracion: `apps/api/drizzle/0004_username_only_auth.sql`

### `propiedades`

Responsabilidad:
- Gestion del catalogo de propiedades y visibilidad por asesor/admin.

Casos de uso:
- `CrearPropiedadUseCase`
- `ListarPropiedadesUseCase`

DTOs:
- No hay carpeta `dto`; el controller maneja payloads HTTP directos.

Entidades:
- `Propiedad`

Value objects:
- `Ids`

Puertos secundarios:
- `IPropiedadRepository`
- `IAutorizadorPropiedades`

Puertos primarios:
- Router HTTP: `crearPropiedadRouter`
- Controller HTTP: `PropiedadController`
- Endpoints:
  - `GET /propiedades`
  - `POST /propiedades`

Adaptadores secundarios:
- `D1PropiedadRepository`
- `PropiedadMapper`
- `AutorizadorPropiedadesAdapter`

Notas:
- La autorizacion de negocio no depende de `auth/domain`.
- La autenticacion tecnica entra por `verifySessionMiddleware`.

### `ventas`

Responsabilidad:
- Pipeline comercial: leads, clientes, citas, contratos y asignacion a asesores.
- `email` se conserva como dato externo de contacto, no como identidad interna.

Casos de uso:
- `RegistrarLeadUseCase`
- `RegistrarClienteDirectoUseCase`
- `ObtenerLeadUseCase`
- `ObtenerClienteUseCase`
- `ObtenerCitaPorIdUseCase`
- `ListarPropiedadesPorClienteUseCase`
- `ListarLeadsUseCase`
- `ListarLeadsPorAsesorUseCase`
- `ListarContratosUseCase`
- `ListarClientesUseCase`
- `ListarCitasUseCase`
- `ListarAsesoresConLeadsUseCase`
- `FirmarContratoUseCase`
- `EvaluarLeadParaAsignarUseCase`
- `CrearContratoUseCase`
- `ConvertirLeadAClienteUseCase`
- `AsignarLeadAAsesorUseCase`
- `AgendarCitaUseCase`
- `ActualizarLeadUseCase`
- `ActualizarClienteUseCase`
- `ActualizarCitaUseCase`

DTOs:
- `LeadDTOs`
- `ClienteDTOs`
- `ContratoDTOs`

Entidades:
- `Lead`
- `Cliente`
- `Cita`
- `Contrato`

Value objects:
- `EstadoLead`
- `IdPropiedad`
- `Ids`
- `TipoVenta`

Puertos secundarios:
- `IVentasRepository`
- `IContratoRepository`
- `IAutorizadorVentas`

Puertos primarios:
- Router HTTP: `ventasRouter`
- Controller HTTP: `VentasController`
- Endpoints:
  - `GET /ventas/pipeline`
  - `POST /ventas/lead`
  - `PUT /ventas/lead/:id`
  - `POST /ventas/cliente`
  - `POST /ventas/cita`
  - `PUT /ventas/lead/:idLead/cita/:idCita`
  - `POST /ventas/convertir`

Adaptadores secundarios:
- `D1VentasRepository`
- `VentasMapper`
- `AutorizadorVentasAdapter`

Adaptadores publicados a otros modulos:
- `ConsultaVentasParaReportesAdapter`
  - implementa `reportes/domain/ports/IConsultaVentasParaReportes`
- `RegistroLeadCaptacionVentasAdapter`
  - implementa `integraciones/domain/ports/IRegistroLeadCaptacion`

Notas:
- `ventas` usa sesion tecnica compartida.
- `ListarLeadsUseCase` no consume puertos desde `auth`.

### `reportes`

Responsabilidad:
- Proyecciones y metricas de lectura para explotacion comercial.
- Consume ventas mediante un puerto de consulta dedicado.

Casos de uso:
- `ObtenerReporteGeneralUseCase`
- `ObtenerEstadisticasGlobalesUseCase`

DTOs:
- `ReportesSalidaDTOs`

Entidades / modelos de lectura:
- `ReporteGeneral`
- `EstadisticasGlobales`

Value objects:
- `PorcentajeConversion`

Puertos secundarios:
- `IConsultaVentasParaReportes`

Puertos primarios:
- Router HTTP: `crearReportesRouter`
- Controller HTTP: `ReportesController`
- Endpoints:
  - `GET /reportes/estadisticas-globales`
  - `GET /reportes/general`

Adaptadores secundarios:
- El adapter concreto viene desde composicion raiz:
  - `ConsultaVentasParaReportesAdapter` en `ventas`

Notas:
- La autenticacion usa sesion compartida.
- La restriccion de rol admin entra por `requireRolesMiddleware(["ADMIN"])`.

### `integraciones`

Responsabilidad:
- Ingreso de eventos externos de captacion.
- Normalizacion del webhook de WhatsApp antes de delegar a ventas.

Casos de uso:
- `ProcesarWhatsAppWebhookUseCase`

DTOs:
- `EntradaWhatsAppWebhook`
- `SalidaWhatsAppWebhook`

Entidades:
- `CaptacionWhatsApp`

Value objects:
- No hay VOs dedicados aun.

Puertos secundarios:
- `IRegistroLeadCaptacion`

Puertos primarios:
- Router HTTP: `crearIntegracionesRouter`
- Controller HTTP: `IntegracionesController`
- Endpoints:
  - `POST /integraciones/webhooks/whatsapp`

Adaptadores secundarios:
- El adapter concreto viene desde composicion raiz:
  - `RegistroLeadCaptacionVentasAdapter` en `ventas`

Notas:
- El webhook no inventa un email como identidad del sistema.
- Si se genera email provisional, se trata explicitamente como dato de contacto externo.

## Comunicacion entre modulos

### `usuarios -> auth`

Tipo:
- Adaptador saliente desde `usuarios/infrastructure`

Contrato:
- `auth/domain/ports/IConsultaCredencialesUsuario`
- `auth/domain/ports/IVerificadorDeClave`

Implementaciones:
- `ConsultaCredencialesUsuarioAdapter`
- `VerificadorDeClavePbkdf2Adapter`

Motivo:
- `auth` necesita leer credenciales y verificar clave sin importar `usuarios/domain`.

### `ventas -> reportes`

Tipo:
- Adaptador saliente desde `ventas/infrastructure/adapters`

Contrato:
- `reportes/domain/ports/IConsultaVentasParaReportes`

Implementacion:
- `ConsultaVentasParaReportesAdapter`

Motivo:
- `reportes` consume solo datos de lectura y no entidades internas de `ventas`.

### `ventas -> integraciones`

Tipo:
- Adaptador saliente desde `ventas/infrastructure/adapters`

Contrato:
- `integraciones/domain/ports/IRegistroLeadCaptacion`

Implementacion:
- `RegistroLeadCaptacionVentasAdapter`

Motivo:
- `integraciones` entrega leads normalizados sin conocer el dominio interno de `ventas`.

### `shared -> todos los modulos protegidos`

Tipo:
- Capacidad transversal tecnica

Contrato:
- `SessionClaims`
- `verifySessionMiddleware`
- `requireRolesMiddleware`

Consumidores actuales:
- `propiedades`
- `ventas`
- `reportes`

Motivo:
- Separar autenticacion tecnica de autorizacion de negocio.

## Estructura final

```text
apps/api/src/lib
├── auth
│   ├── application
│   │   ├── dto
│   │   └── use-cases
│   ├── domain
│   │   ├── entities
│   │   ├── errors
│   │   ├── ports
│   │   └── value-objects
│   └── infrastructure
│       ├── http
│       └── security
├── integraciones
│   ├── application
│   │   └── use-cases
│   ├── domain
│   │   ├── entities
│   │   └── ports
│   └── infrastructure
│       └── http
├── propiedades
│   ├── application
│   │   └── use-cases
│   ├── domain
│   │   ├── entities
│   │   ├── errors
│   │   ├── ports
│   │   └── value-objects
│   └── infrastructure
│       ├── http
│       ├── persistence
│       └── security
├── reportes
│   ├── application
│   │   ├── dto
│   │   └── use-cases
│   ├── domain
│   │   ├── entities
│   │   ├── ports
│   │   └── value-objects
│   └── infrastructure
│       └── http
├── shared
│   ├── application
│   ├── domain
│   │   ├── errors
│   │   ├── ports
│   │   ├── types
│   │   └── value-objects
│   └── infrastructure
│       ├── persistence
│       ├── security
│       └── session
├── usuarios
│   ├── application
│   │   ├── dto
│   │   └── use-cases
│   ├── domain
│   │   ├── entities
│   │   ├── errors
│   │   ├── ports
│   │   └── value-objects
│   └── infrastructure
│       ├── adapters
│       ├── http
│       ├── persistence
│       └── security
└── ventas
    ├── application
    │   ├── dto
    │   └── use-cases
    ├── domain
    │   ├── entities
    │   ├── errors
    │   ├── ports
    │   └── value-objects
    └── infrastructure
        ├── adapters
        ├── http
        ├── persistence
        └── security
```

## Reglas vigentes

- `auth` no debe volver a importar `usuarios/domain`.
- `propiedades`, `ventas` y `reportes` no deben importar puertos o middlewares desde `auth`.
- La autorizacion de negocio debe vivir en puertos propios por contexto.
- `email` en `ventas` e `integraciones` es dato de contacto externo.
- `username` es la identidad de login interna.

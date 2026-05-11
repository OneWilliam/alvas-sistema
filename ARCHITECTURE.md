# Alvas-Sistema - Arquitectura Actual del Backend

Este documento describe el estado actual del backend en `apps/api/src/lib`, la semantica de capas segun DDD + arquitectura hexagonal, los aggregate roots identificados, los puertos primarios/secundarios y las comunicaciones entre bounded contexts.

Validacion actual:
- `bun run lint`: OK
- `bun run typecheck`: OK

## Capas y logica

- `Domain`: reglas de negocio puras, invariantes, comportamiento de entidades y value objects.
- `Application / use cases`: orquestacion de negocio. Coordinan aggregates, puertos y transacciones, pero no deben contener reglas de negocio profundas que pertenezcan al dominio.
- `Infrastructure / adapters`: implementacion concreta de puertos, HTTP, DB, crypto e integraciones externas.

## Semantica de puertos y adaptadores

- `Puertos primarios`: interfaces de entrada del sistema. En este backend viven en `application/ports/in` y son implementadas por los use cases.
- `Puertos secundarios`: interfaces de salida necesarias para persistencia, tokens, autorizacion o integraciones. En este backend viven en `domain/ports`.
- `Adaptadores primarios`: HTTP routers/controllers que traducen requests externos a DTOs/comandos de aplicacion.
- `Adaptadores secundarios`: implementaciones concretas de puertos secundarios en `infrastructure`.
- `Composition root`: `apps/api/src/main.ts` compone repositorios, generadores, token providers y use cases concretos; los controllers ya no crean esas dependencias directamente.

## Aggregate roots por bounded context

### `shared`
- No tiene aggregate root. Es un modulo transversal tecnico.

### `auth`
- Aggregate root: `Sesion`
- Responsabilidad: credenciales, login, refresh, tokens y sesion autenticada.

### `usuarios`
- Aggregate root: `Usuario`
- Responsabilidad: identidad interna del sistema (`id`, `username`, `nombre`, `rol`, `estado`, `hashClave`).

### `propiedades`
- Aggregate root: `Propiedad`
- Responsabilidad: catalogo de propiedades y asignacion/visibilidad por asesor.

### `ventas`
- Este bounded context tiene multiples aggregate roots. Eso es valido en DDD.
- Aggregate roots:
  - `Lead`
  - `Cliente`
  - `Contrato`
- `Cita` no se trata como root independiente; pertenece al agregado comercial que la contiene.
- Responsabilidad: pipeline comercial, clientes, citas, conversiones y contratos.

### `reportes`
- No tiene aggregate root transaccional y no debe forzarse uno artificial.
- Es un `read context` puro.
- Modelos de lectura/proyeccion actuales:
  - `ReporteGeneral`
  - `EstadisticasGlobales`
- Responsabilidad: metricas, dashboards y consultas derivadas.

### `integraciones`
- Aggregate root: `Captacion`
- Modelos por canal:
  - `CaptacionWhatsApp` como normalizador/canal de entrada
- Responsabilidad: captacion multicanal y normalizacion de entradas externas antes de delegar a `ventas`.

## Inventario por modulo

### `auth`

Use cases:
- `IniciarSesionUseCase`
- `RenovarSesionUseCase`

Puertos primarios:
- `IIniciarSesion`
- `IRenovarSesion`

Puertos secundarios:
- `IConsultaCredencialesUsuario`
- `IVerificadorDeClave`
- `ITokenProvider`

DTOs:
- `SesionAutenticadaDTO`
- `RenovarSesionDTO`

Entidades:
- `Sesion`

Value objects:
- `AuthToken`
- `RefreshToken`
- `RolAcceso`

Adaptadores secundarios:
- `HmacTokenProvider`
- `TokenProviderFactory`

Adaptadores primarios:
- `AuthController`
- `crearAuthRouter`

### `usuarios`

Use cases:
- `CrearUsuarioUseCase`
- `ListarUsuariosUseCase`
- `ObtenerUsuarioUseCase`
- `ActualizarUsuarioUseCase`

Puertos primarios:
- `ICrearUsuario`
- `IListarUsuarios`
- `IObtenerUsuario`
- `IActualizarUsuario`

Puertos secundarios:
- `IUsuarioRepository`
- `IPasswordHasher`

DTOs:
- `CrearUsuarioDTO`
- `UsuarioRespuestaDTO`
- `UsuarioOutputDTO`
- `ActualizarUsuarioInputDTO`
- `ActualizarUsuarioBodyDTO`
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

Adaptadores secundarios:
- `D1UsuarioRepository`
- `UsuarioMapper`
- `Pbkdf2PasswordHasher`

Adaptadores hacia otros contextos:
- `ConsultaCredencialesUsuarioAdapter`
- `VerificadorDeClavePbkdf2Adapter`

Adaptadores primarios:
- `UsuarioController`
- `crearUsuarioRouter`

### `propiedades`

Use cases:
- `CrearPropiedadUseCase`
- `ListarPropiedadesUseCase`

Puertos primarios:
- `ICrearPropiedad`
- `IListarPropiedades`

Puertos secundarios:
- `IPropiedadRepository`
- `IAutorizadorPropiedades`

DTOs:
- `CrearPropiedadDTO`
- `PropiedadRespuestaDTO`

Entidades:
- `Propiedad`

Value objects:
- `Ids`

Adaptadores secundarios:
- `D1PropiedadRepository`
- `PropiedadMapper`
- `AutorizadorPropiedadesAdapter`

Adaptadores primarios:
- `PropiedadController`
- `crearPropiedadRouter`

### `ventas`

Use cases expuestos hoy por HTTP:
- `RegistrarLeadUseCase`
- `RegistrarClienteDirectoUseCase`
- `AgendarCitaUseCase`
- `ConvertirLeadAClienteUseCase`
- `ActualizarLeadUseCase`
- `ActualizarCitaUseCase`

Otros use cases existentes:
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
- `AsignarLeadAAsesorUseCase`
- `ActualizarClienteUseCase`

Puertos primarios implementados:
- `IActualizarCliente`
- `IRegistrarLead`
- `IRegistrarClienteDirecto`
- `IAgendarCita`
- `IConvertirLeadACliente`
- `IActualizarLead`
- `IActualizarCita`
- `IObtenerLead`
- `IObtenerCliente`
- `IObtenerCitaPorId`
- `IListarLeads`
- `IListarLeadsPorAsesor`
- `IListarClientes`
- `IListarCitas`
- `IListarAsesoresConLeads`

Puertos secundarios:
- `IVentasRepository`
- `IContratoRepository`
- `IAutorizadorVentas`

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

Adaptadores secundarios:
- `D1VentasRepository`
- `VentasMapper`
- `AutorizadorVentasAdapter`

Adaptadores publicados a otros contextos:
- `ConsultaVentasParaReportesAdapter`
- `RegistroLeadCaptacionVentasAdapter`

Adaptadores primarios:
- `VentasController`
- `crearVentasRouter`

### `reportes`

Use cases:
- `ObtenerReporteGeneralUseCase`
- `ObtenerEstadisticasGlobalesUseCase`

Puertos primarios:
- `IObtenerReporteGeneral`
- `IObtenerEstadisticasGlobales`

Puertos secundarios:
- `IConsultaVentasParaReportes`

DTOs:
- `ReportesSalidaDTOs`

Modelos de lectura:
- `ReporteGeneral`
- `EstadisticasGlobales`

Value objects:
- `PorcentajeConversion`

Adaptadores primarios:
- `ReportesController`
- `crearReportesRouter`

Adaptadores secundarios:
- El adapter concreto se compone desde `ventas`: `ConsultaVentasParaReportesAdapter`

### `integraciones`

Use cases:
- `ProcesarCaptacionEntranteUseCase`
- `ProcesarWhatsAppWebhookUseCase`

Puertos primarios:
- `IProcesarCaptacionEntrante`
- `IProcesarWhatsAppWebhook`

Puertos secundarios:
- `IRegistroLeadCaptacion`

DTOs:
- `CaptacionEntranteDTO`
- `EntradaWhatsAppWebhookDTO`
- `CaptacionProcesadaDTO`

Entidades:
- `Captacion`
- `CaptacionWhatsApp`

Value objects:
- `CanalCaptacion`
- `OrigenCaptacion`
- `DatosContactoCaptacion`

Adaptadores primarios:
- `IntegracionesController`
- `crearIntegracionesRouter`

Entradas HTTP actuales:
- `POST /integraciones/captaciones`
- `POST /integraciones/webhooks/whatsapp`

Adaptadores secundarios:
- El adapter concreto se compone desde `ventas`: `RegistroLeadCaptacionVentasAdapter`

## Comunicaciones entre modulos

### `usuarios -> auth`
- `usuarios` implementa puertos secundarios definidos por `auth`.
- Contratos:
  - `IConsultaCredencialesUsuario`
  - `IVerificadorDeClave`
- Implementaciones:
  - `ConsultaCredencialesUsuarioAdapter`
  - `VerificadorDeClavePbkdf2Adapter`

### `ventas -> reportes`
- `ventas` implementa el puerto de lectura `IConsultaVentasParaReportes`.
- Implementacion:
  - `ConsultaVentasParaReportesAdapter`
- `reportes` no importa entidades internas de `ventas`; consume solo el contrato de lectura.

### `ventas -> integraciones`
- `ventas` implementa el puerto `IRegistroLeadCaptacion`.
- Implementacion:
  - `RegistroLeadCaptacionVentasAdapter`
- `integraciones` normaliza entradas multicanal y delega el alta comercial a `ventas`.

### `shared -> modulos protegidos`
- `shared` provee la capacidad transversal de sesion tecnica:
  - `SessionClaims`
  - `verifySessionMiddleware`
  - `requireRolesMiddleware`
- Consumidores actuales:
  - `propiedades`
  - `ventas`
  - `reportes`

## Estructura final

```text
apps/api/src/lib
├── auth
│   ├── application
│   │   ├── dto
│   │   ├── ports/in
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
│   │   ├── dto
│   │   ├── ports/in
│   │   └── use-cases
│   ├── domain
│   │   ├── entities
│   │   ├── ports
│   │   └── value-objects
│   └── infrastructure
│       └── http
├── propiedades
│   ├── application
│   │   ├── dto
│   │   ├── ports/in
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
│   │   ├── ports/in
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
│   │   ├── ports/in
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
    │   ├── ports/in
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
- La autorizacion de negocio vive en puertos secundarios propios por contexto.
- `reportes` es un contexto de lectura, no un modulo transaccional.
- `integraciones` es un contexto de captacion multicanal; WhatsApp es solo un canal/adaptador.
- `username` es la identidad de login interna.
- `email` en `ventas` e `integraciones` se trata como dato externo de contacto, no identidad interna.

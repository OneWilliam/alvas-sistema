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
- `Composition root`: `apps/api/src/main.ts` monta rutas y delega el armado de dependencias a `apps/api/src/composition`. Esa carpeta vive fuera de los bounded contexts para poder cruzar modulos sin contaminar sus capas internas.

## ACL / Anti-Corruption Layer

Una `ACL` protege el modelo de un bounded context cuando necesita comunicarse con otro contexto o con un sistema externo. En este backend no se implementa como un package separado, sino como un patron explicito de `puerto del consumidor + adapter traductor + composition root`.

Reglas aplicadas:

- El contexto consumidor define el contrato con su propio lenguaje.
- El contexto proveedor no filtra sus entidades, repositorios ni value objects internos.
- El adapter traduce entre el modelo proveedor y el contrato del consumidor.
- `apps/api/src/composition` arma las dependencias concretas porque es el unico punto autorizado para conocer mas de un contexto.

ACLs actuales:

- `auth <- usuarios`: `auth` define `IConsultaCredencialesUsuario` e `IVerificadorDeClave`; `usuarios` provee `ConsultaCredencialesUsuarioAdapter` y `VerificadorDeClavePbkdf2Adapter`.
- `reportes <- ventas`: `reportes` define `IConsultaVentasParaReportes`; `ventas` provee `ConsultaVentasParaReportesAdapter`.
- `integraciones <- ventas`: `integraciones` define `IRegistroLeadCaptacion`; `ventas` provee `RegistroLeadCaptacionVentasAdapter`.

Esto es una ACL pragmatica: cumple la proteccion de modelos y dependencias sin crear una capa ceremonial adicional. Si una integracion crece en complejidad, el siguiente paso es mover esos adapters a carpetas nombradas explicitamente como `acl` y agregar mappers/modelos de traduccion dedicados.

## Submodulos internos

- Un bounded context puede tener submodulos internos. En DDD esto es valido cuando ordena capacidades del mismo lenguaje ubicuo sin crear fronteras de negocio artificiales.
- En `ventas`, submodulos conceptuales como `captacion`, `clientes`, `citas` y `contratos` son validos como organizacion interna porque comparten el mismo contexto comercial.
- Un submodulo interno no debe importar dominio de otro bounded context ni definir reglas incompatibles con el contexto padre.
- Si un submodulo empieza a necesitar su propio lenguaje, datos, permisos y ciclo de vida independiente, entonces deja de ser solo organizacion interna y puede ser candidato a bounded context separado.

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

## Ciclos de vida de dominio

### `auth/Sesion`
- Tipo de lifecycle: tecnico y efimero.
- Inicio: `Sesion.abrir` despues de credenciales validas.
- Cambios: renovacion por `RenovarSesionUseCase`, que emite nuevos tokens.
- Cierre: no hay estado persistido de cierre en dominio; la expiracion/rechazo depende de tokens.
- Observacion: si luego se requiere revocacion, blacklist o auditoria de sesiones, `Sesion` necesitara persistencia y estados explicitos.

### `usuarios/Usuario`
- Tipo de lifecycle: transaccional simple.
- Estados: `ACTIVO`, `DESHABILITADO`.
- Inicio: `Usuario.crear`, por defecto en `ACTIVO`.
- Cambios permitidos: `cambiarUsername`, `cambiarNombre`, `cambiarRol`, `cambiarHashClave`.
- Cierre funcional: `deshabilitar`, que mueve a `DESHABILITADO`.
- Invariante: no se puede deshabilitar un usuario ya deshabilitado.

### `propiedades/Propiedad`
- Tipo de lifecycle: catalogo simple.
- Estados: no hay estados explicitos actualmente.
- Inicio: `Propiedad.crear`.
- Cambios: hoy no hay comportamiento de actualizacion modelado en dominio.
- Cierre: no existe baja, publicacion, suspension o archivado en el modelo actual.
- Observacion: si el negocio requiere publicar/despublicar propiedades, ese lifecycle debe agregarse como estado propio del agregado.

### `ventas/Lead`
- Tipo de lifecycle: comercial transaccional.
- Estados: `NUEVO`, `CONTACTO`, `AGENDADO`, `TRABAJANDO`, `CONVERTIDO`, `PERDIDO`.
- Inicio: `Lead.registrar`, siempre en `NUEVO`.
- Cambios permitidos: actualizar datos, cambiar asesor, cambiar estado, actualizar propiedad de interes, agendar/actualizar citas.
- Cierre: `CONVERTIDO` o `PERDIDO`.
- Invariantes: no se pueden agendar citas ni actualizar datos de contacto si el lead esta cerrado.

### `ventas/Cita`
- Tipo de lifecycle: entidad interna del agregado comercial.
- Estados: `PENDIENTE`, `REALIZADA`, `CANCELADA`, `REPROGRAMADA`.
- Inicio: `Cita.crear`, usada desde el agregado `Lead`.
- Cambios permitidos: `reprogramar`, `marcarComoRealizada`, `cancelar`, `actualizarObservacion`, `actualizarPropiedad`.
- Cierre: `REALIZADA` o `CANCELADA`.
- Invariantes: fecha fin debe ser posterior a fecha inicio; no se puede reprogramar una cita realizada; no se puede marcar como realizada una cita cancelada.

### `ventas/Cliente`
- Tipo de lifecycle: cartera simple.
- Estados: no hay estados explicitos actualmente.
- Inicio: `Cliente.crear`, normalmente desde cliente directo o conversion de lead.
- Cambios permitidos: `actualizarDatosContacto`.
- Cierre: no hay baja, inactivacion o estado de cartera en el modelo actual.
- Observacion: si el CRM necesita distinguir activo, inactivo, bloqueado o archivado, debe agregarse un estado propio de `Cliente`.

### `ventas/Contrato`
- Tipo de lifecycle: contractual transaccional.
- Estados: `BORRADOR`, `VIGENTE`, `FINALIZADO`, `CANCELADO`.
- Inicio: `Contrato.crear`, siempre en `BORRADOR`.
- Cambios permitidos: `firmar`, `finalizar`.
- Cierre: `FINALIZADO` o `CANCELADO`.
- Invariantes: solo se puede firmar desde `BORRADOR`; fecha fin debe ser posterior a fecha inicio.
- Observacion: existe estado `CANCELADO`, pero aun no hay metodo de dominio para cancelar contrato.

### `integraciones/Captacion`
- Tipo de lifecycle: normalizacion de entrada.
- Estados: no hay estados persistidos actualmente.
- Inicio: `Captacion.registrar`, desde un canal generico o desde `CaptacionWhatsApp`.
- Cambios: no tiene mutaciones; representa una entrada normalizada lista para delegar a `ventas`.
- Cierre: termina cuando `IRegistroLeadCaptacion` registra la captacion como lead en `ventas`.
- Observacion: si se necesita reintento, rechazo, deduplicacion o auditoria de eventos externos, `Captacion` debe pasar a lifecycle persistido con estados.

### `reportes`
- Tipo de lifecycle: lectura/proyeccion.
- Estados: no hay estados transaccionales.
- Inicio: cada consulta crea una proyeccion (`ReporteGeneral`, `EstadisticasGlobales`) a partir de fuentes de lectura.
- Cambios: no se mutan; se recalculan.
- Cierre: no aplica.
- Observacion: si se materializan reportes historicos, apareceria un lifecycle nuevo de generacion, consolidacion y expiracion.

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
- `CrearContratoUseCase`
- `AsignarLeadAAsesorUseCase`
- `ActualizarClienteUseCase`

Servicios de Dominio:
- `EvaluadorAsignacionService`

Puertos primarios implementados:
- `IActualizarCliente`
- `IAsignarLeadAAsesor`
- `ICrearContrato`
- `IRegistrarLead`
- `IRegistrarClienteDirecto`
- `IAgendarCita`
- `IConvertirLeadACliente`
- `IFirmarContrato`
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
- `IListarContratos`
- `IListarPropiedadesPorCliente`

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
- Tipo de relacion: ACL.
- `usuarios` implementa puertos secundarios definidos por `auth`.
- Contratos:
  - `IConsultaCredencialesUsuario`
  - `IVerificadorDeClave`
- Implementaciones:
  - `ConsultaCredencialesUsuarioAdapter`
  - `VerificadorDeClavePbkdf2Adapter`

### `ventas -> reportes`
- Tipo de relacion: ACL de lectura.
- `ventas` implementa el puerto de lectura `IConsultaVentasParaReportes`.
- Implementacion:
  - `ConsultaVentasParaReportesAdapter`
- `reportes` no importa entidades internas de `ventas`; consume solo el contrato de lectura.

### `ventas -> integraciones`
- Tipo de relacion: ACL de captacion.
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
apps/api/src
├── composition
│   ├── auth.ts
│   ├── integraciones.ts
│   ├── propiedades.ts
│   ├── reportes.ts
│   ├── usuarios.ts
│   └── ventas.ts
└── lib
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

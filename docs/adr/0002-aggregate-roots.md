# ADR 0002: Definicion de Aggregate Roots

## Estado

Aceptado

## Contexto

El backend esta organizado por bounded contexts (`auth`, `usuarios`, `propiedades`, `ventas`, `reportes`, `integraciones`). Cada contexto necesita limites transaccionales claros para proteger invariantes sin crear agregados grandes ni acoplar ciclos de vida independientes.

La arquitectura debe evitar referencias directas entre agregados de distintos contextos. Cuando una regla necesita relacionar conceptos externos, se usan IDs, puertos o adaptadores ACL desde el consumidor.

## Decision

Se definen los siguientes aggregate roots y modelos de lectura:

### `auth`

- **Aggregate root:** `Sesion`.
- **Responsabilidad:** representar una sesion autenticada emitida despues de credenciales validas.
- **Invariantes:** tokens obligatorios y usuario/rol consistentes en la sesion emitida.
- **Nota:** hoy es un agregado tecnico y efimero; si luego hay revocacion o auditoria, requerira persistencia y estados explicitos.

### `usuarios`

- **Aggregate root:** `Usuario`.
- **Responsabilidad:** identidad interna del sistema (`id`, `username`, `nombre`, `rol`, `estado`, `hashClave`).
- **Invariantes:** `username`, `nombre`, `rol`, `estado` y `hashClave` se validan con value objects; un usuario no puede deshabilitarse dos veces.

### `propiedades`

- **Aggregate root:** `Propiedad`.
- **Responsabilidad:** catalogo de propiedades y visibilidad/asignacion por asesor.
- **Invariantes actuales:** identidad y datos base de propiedad validos al crear/reconstituir.
- **Nota:** si el negocio requiere publicar, suspender o archivar propiedades, debe agregarse un estado propio del agregado.

### `ventas`

- **Aggregate roots:** `Lead`, `Cliente`, `Contrato`.
- **Entidad interna del agregado comercial:** `Cita`.
- **Responsabilidad:** pipeline comercial, citas, conversiones, clientes y contratos.

Decisiones:

- `Lead` protege el ciclo de vida del prospecto. Contiene operaciones sobre `Cita` porque la agenda depende del estado del lead.
- `Cita` no es root independiente en el modelo actual; se modifica desde el flujo comercial asociado al lead.
- `Cliente` tiene ciclo de vida propio posterior a la conversion.
- `Contrato` es agregado independiente porque su ciclo contractual y sus invariantes no deben quedar dentro de `Lead` ni `Cliente`.

Invariantes:

- `Lead`: no agenda citas ni actualiza datos si esta cerrado; no puede convertirse dos veces.
- `Cita`: fecha fin posterior a fecha inicio; no reprograma citas realizadas; no marca como realizada una cita cancelada.
- `Contrato`: solo firma desde `BORRADOR`; fecha fin posterior a fecha inicio.

### `integraciones`

- **Aggregate root:** `Captacion`.
- **Modelo por canal:** `CaptacionWhatsApp`.
- **Responsabilidad:** normalizar entradas multicanal antes de delegar el alta comercial a `ventas`.
- **Invariantes:** canal soportado, origen obligatorio, contacto con nombre y telefono obligatorios, tipo normalizado.
- **Nota:** si se necesita reintento, deduplicacion, rechazo o auditoria de eventos externos, `Captacion` debe evolucionar a un ciclo persistido con estados.

### `reportes`

- **No tiene aggregate root transaccional actual.**
- **Modelos de lectura:** `ReporteGeneral`, `EstadisticasGlobales`.
- **Responsabilidad:** consultas derivadas y metricas.
- **Decision:** no forzar un agregado artificial; `reportes` funciona como read context. Si luego se materializan reportes historicos, se evaluara un nuevo ciclo de vida.

## Referencias Entre Agregados

- Entre agregados se usan IDs, no referencias de memoria directas.
- Entre bounded contexts se usan puertos del consumidor y adaptadores ACL.
- La composition root puede conocer implementaciones concretas para cablear dependencias, pero las capas internas no deben importar modelos internos de otros contextos.

## Consecuencias

- **Positivas:** limites transaccionales pequenos, reglas ubicadas en el agregado correcto, menor acoplamiento entre contextos.
- **Negativas:** las consultas que combinan datos de varios agregados requieren composicion en aplicacion, infraestructura o modelos de lectura.
- **Compromiso:** si una entidad empieza a tener lenguaje, permisos, estados y ciclo de vida independientes, debe reevaluarse si merece ser aggregate root.

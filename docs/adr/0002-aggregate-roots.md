# ADR 0002: Definición de Aggregate Roots

## Estado
Aceptado

## Contexto
En el contexto delimitado de `ventas`, interactúan entidades como `Lead`, `Cita`, `Cliente`, `Contrato`. Necesitábamos definir qué entidades actúan como raíces de agregación para asegurar la consistencia y proteger las invariantes de negocio.

## Decisión
Se definen los siguientes **Aggregate Roots** en el módulo de ventas:
1. **`Lead`:** Gestiona y protege el ciclo de vida inicial del prospecto. Contiene a la entidad `Cita` como parte de su límite transaccional. Regla de oro: No se puede agendar una cita directamente; debe hacerse a través de `lead.agendarCita(cita)`, ya que el Lead debe validar que su estado no sea "CERRADO".
2. **`Cliente`:** Un Lead convertido. Tiene un ciclo de vida propio posterior a la venta inicial.
3. **`Contrato`:** Agregado independiente que relaciona a un Cliente, una Propiedad y un Asesor. No puede ser parte de `Lead` ni de `Cliente` dado que su ciclo de vida y sus invariantes legales y de estado (FIRMADO, VENCIDO) son demasiado pesados para vivir dentro de ellos.

Las referencias entre Agregados distintos se realizarán **únicamente mediante IDs** (ej. `Lead` tiene un `idCliente` opcional, pero no una referencia de memoria al objeto `Cliente`), siguiendo la recomendación de Vernon para asegurar la consistencia eventual y escalabilidad.

## Consecuencias
- **Positivas:** Límites transaccionales claros. Evitamos bloqueos de base de datos grandes. Si falla la actualización de una Cita, falla todo el Lead.
- **Negativas:** Para mostrar información conjunta (ej. "Lead con detalles completos del Cliente asociado") se requerirá que la capa de aplicación o infraestructura haga múltiples consultas y las combine.

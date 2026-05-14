# ADR 0001: Adopcion de Diseno Tactico DDD

## Estado

Aceptado

## Contexto

El backend de ALVAS gestiona capacidades de ventas inmobiliarias, usuarios internos, autenticacion, propiedades, reportes e integraciones de captacion. Estas capacidades requieren reglas de negocio explicitas y consistentes: estados de leads, citas y contratos, identidad de usuarios, tokens de sesion, canales de captacion y metricas derivadas.

Se detecto el riesgo de que reglas de negocio quedaran dispersas en controllers, repositorios o casos de uso. Tambien existia el riesgo de que primitivos como `string` o `number` representaran conceptos del negocio sin validacion local, generando estados invalidos dificiles de rastrear.

## Decision

Adoptamos patrones tacticos de DDD para ubicar reglas de negocio en el nucleo del modelo y mantener la arquitectura hexagonal:

1. **Value Objects para conceptos con reglas propias.**
   - `usuarios`: `IdUsuario`, `Username`, `Nombre`, `HashClave`, `Rol`, `EstadoUsuario`.
   - `auth`: `AuthToken`, `RefreshToken`, `RolAcceso`.
   - `ventas`: `EstadoLead`, `TipoVenta`, IDs de `Lead`, `Cita`, `Cliente`, `Contrato` y `Propiedad`.
   - `integraciones`: `CanalCaptacion`, `OrigenCaptacion`, `DatosContactoCaptacion`.
   - `reportes`: `PorcentajeConversion`.

2. **Entidades y Aggregate Roots para ciclos de vida con identidad.**
   - Las entidades protegen transiciones e invariantes propias en vez de exponer setters libres.
   - Los agregados se modifican mediante metodos de dominio como `lead.agendarCita`, `lead.convertirACliente`, `usuario.deshabilitar` o `contrato.firmar`.

3. **Domain Services solo para politicas puras que no pertenecen naturalmente a una entidad.**
   - `EvaluadorAsignacionService` decide el asesor con menor carga a partir de datos ya cargados.
   - El servicio de dominio no consulta repositorios ni hace I/O. La capa de aplicacion coordina la lectura/escritura y entrega datos simples al dominio.

4. **Casos de uso como orquestadores de aplicacion.**
   - Los use cases reciben DTOs, consultan puertos secundarios, invocan dominio y guardan resultados.
   - No se inyectan use cases dentro de otros use cases para evitar jerarquias de orquestadores.

5. **Mappers y adaptadores en infraestructura.**
   - El dominio no recibe objetos crudos de Drizzle, Hono, D1 ni proveedores externos.
   - La infraestructura traduce entre persistencia/HTTP y entidades/VOs mediante repositorios y mappers.

## Invariantes Relevantes

- `Username`: longitud valida, normalizacion y caracteres permitidos.
- `Nombre`: longitud minima y maxima.
- `Rol` y `EstadoUsuario`: solo aceptan valores del lenguaje ubicuo.
- `AuthToken` y `RefreshToken`: no pueden estar vacios.
- `CanalCaptacion`, `OrigenCaptacion` y `DatosContactoCaptacion`: protegen entradas de captacion obligatorias.
- `PorcentajeConversion`: evita porcentajes invalidos y protege division por cero.
- `Lead`: no permite agendar citas ni actualizar datos cuando esta cerrado; no permite conversion duplicada.
- `Cita`: fecha fin posterior a fecha inicio; no permite reprogramar una cita realizada.
- `Contrato`: solo se firma desde `BORRADOR`; fecha fin posterior a fecha inicio.
- `Usuario`: no puede deshabilitarse dos veces.

## Consecuencias

- **Positivas:** el dominio queda testeable sin base de datos, HTTP ni framework; las reglas quedan cerca del lenguaje ubicuo; los casos de uso se mantienen planos y enfocados en orquestacion.
- **Negativas:** aumenta el numero de archivos y la necesidad de mapear entre DTOs, persistencia y dominio.
- **Compromiso:** las reglas de negocio nuevas deben entrar primero por dominio o aplicacion segun corresponda, y no por controllers ni repositorios concretos.

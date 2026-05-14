# Plan de Pruebas (Test Plan) v1.0

Este documento define la estrategia de aseguramiento de calidad, enfocada en pruebas unitarias, pruebas de aplicación con puertos/fakes y cobertura del núcleo de dominio del servicio `apps/api`.

## 1. Alcance de las Pruebas

- **Pruebas Unitarias de Value Objects:** validar normalización, rangos y estados permitidos.
- **Pruebas de Invariantes en Entidades y Aggregate Roots:** verificar que el dominio rechace estados inválidos.
- **Pruebas de Casos de Uso con fakes in-memory:** validar orquestación de aplicación mediante puertos, sin base de datos ni HTTP.
- **Reporte de Cobertura:** evidenciar qué parte del núcleo probado queda blindada por tests automatizados.

Este plan se alinea con con el fin de mapear los casos de prueba hacia eventos y Bounded Contexts al cubrir:

- **Unit Testing:** validación aislada de Value Objects, entidades, Aggregate Roots y Domain Services.
- **Integration/Application Testing:** validación de casos de uso mediante puertos y fakes in-memory, sin acoplamiento a D1, Drizzle ni HTTP.
- **Testing Architecture:** verificación práctica de que el dominio y la aplicación pueden probarse sin depender de infraestructura.

## 2. Ubicación de la Suite

```text
apps/api/test/
  unit/
    auth/
    integraciones/
    reportes/
    usuarios/
    ventas/
```

## 3. Herramientas Utilizadas

- **Test Runner:** `bun test`.
- **Cobertura:** `bun test --coverage`.
- **Validación estática:** `bun run typecheck` y `bun run lint`.

## 4. Plan del Aggregate Root Priorizado

### Aggregate Root Seleccionado

`Lead`, dentro del bounded context `ventas`.

### Casos de Uso Transaccionales

`AgendarCitaUseCase` y `ConvertirLeadAClienteUseCase` operan sobre el agregado `Lead`.

### Invariantes Protegidas

- Un lead cerrado (`PERDIDO` o `CONVERTIDO`) no puede recibir nuevas citas.
- Un lead no puede convertirse dos veces a cliente.
- Una cita debe tener fecha de fin posterior a la fecha de inicio.
- La conversión a cliente se registra mediante IDs, evitando referencias directas entre agregados.

### Casos Unitarios de Aislamiento

- `Lead` rechaza agendar citas cuando está cerrado.
- `Lead` rechaza conversión duplicada.
- `Cita` rechaza rangos de fecha inválidos y reprogramación después de realizada.

### Estrategia de Test Doubles

- Los puertos de salida (`IVentasRepository`, `IUsuarioRepository`, `IConsultaCredencialesUsuario`, `IVerificadorDeClave`, `ITokenProvider`) se reemplazan por fakes in-memory y stubs simples.
- Se usan mocks/spies con `mock()` de Bun para verificar interacciones relevantes con puertos de salida, por ejemplo llamadas a `registrarActividad` y `hashear`.
- Los tests de aplicación llaman use cases reales y verifican comportamiento observable.

## 5. Matriz de Pruebas Priorizadas

| Componente                                                    | Bounded Context | Tipo de Prueba           | Criterio de Aceptación                                                          |
| :------------------------------------------------------------ | :-------------- | :----------------------- | :------------------------------------------------------------------------------ |
| `AuthToken`, `RefreshToken`                                   | `auth`          | Unitaria                 | Deben rechazar tokens vacíos.                                                   |
| `Sesion`                                                      | `auth`          | Unitaria                 | Debe exponer tokens y datos de usuario autenticado.                             |
| `IniciarSesionUseCase`                                        | `auth`          | Aplicación con fakes     | Debe emitir tokens con credenciales válidas y rechazar usuarios deshabilitados. |
| `Username`, `Nombre`, `Rol`, `EstadoUsuario`                  | `usuarios`      | Unitaria                 | Deben normalizar valores y rechazar estados fuera del lenguaje ubicuo.          |
| `Usuario`                                                     | `usuarios`      | Unitaria                 | Nace activo y no puede deshabilitarse dos veces.                                |
| `CrearUsuarioUseCase`                                         | `usuarios`      | Aplicación con fake repo | Debe guardar usuario con hash y rechazar duplicados.                            |
| `EstadoLead`                                                  | `ventas`        | Unitaria                 | Debe rechazar cualquier string que no pertenezca al enum.                       |
| `TipoVenta`                                                   | `ventas`        | Unitaria                 | Debe normalizar valores y rechazar inválidos.                                   |
| `Lead`                                                        | `ventas`        | Unitaria                 | No debe agendar citas si está cerrado ni convertirse dos veces.                 |
| `Cita`                                                        | `ventas`        | Unitaria                 | Debe validar rangos de fecha y no reprogramar citas realizadas.                 |
| `Contrato`                                                    | `ventas`        | Unitaria                 | Debe iniciar en BORRADOR y solo firmarse desde ese estado.                      |
| `EvaluadorAsignacionService`                                  | `ventas`        | Unitaria                 | Debe elegir el asesor con menor carga y fallar si no hay asesores.              |
| `AgendarCitaUseCase`                                          | `ventas`        | Aplicación con fake repo | Debe agregar cita al lead y registrar actividad.                                |
| `ConvertirLeadAClienteUseCase`                                | `ventas`        | Aplicación con fake repo | Debe crear cliente y cerrar lead.                                               |
| `CanalCaptacion`, `OrigenCaptacion`, `DatosContactoCaptacion` | `integraciones` | Unitaria                 | Deben normalizar canal/origen/contacto y rechazar datos obligatorios vacíos.    |
| `Captacion`                                                   | `integraciones` | Unitaria                 | Debe normalizar canal/tipo/contacto y generar email local si falta correo.      |
| `PorcentajeConversion`                                        | `reportes`      | Unitaria                 | Debe calcular porcentaje derivado y proteger divisiones por cero.               |

## 6. Ejecución de las Pruebas

```bash
# Ejecutar pruebas unitarias y de aplicación
bun test

# Ejecutar pruebas con cobertura
bun test --coverage

# Validar tipos y reglas estáticas
bun run typecheck
bun run lint
```

## 7. Criterio de Cobertura

La cobertura se interpreta como evidencia de blindaje del núcleo probado, no como garantía absoluta del backend completo. La suite prioriza reglas de dominio, invariantes y casos de uso de alto valor. El reporte asociado está en `apps/api/coverage-report.md`.

## 8. Prueba de Código vs Prueba de Arquitectura

- **Probar código:** verifica algoritmos, validaciones e invariantes locales en clases y funciones concretas.
- **Probar arquitectura:** verifica que el sistema pueda ejercitar casos de uso por puertos, con dependencias sustituibles, sin acoplarse a DB, HTTP o frameworks.

La suite actual prueba ambas dimensiones: los unit tests validan el modelo de dominio; los tests de aplicación con fakes verifican que la arquitectura hexagonal permite sustituir adaptadores secundarios sin cambiar los casos de uso.

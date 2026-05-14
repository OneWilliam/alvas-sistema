# Plan de Pruebas (Test Plan) v1.0 - Semana 05

Este documento define la estrategia de aseguramiento de calidad (QA) y pruebas automatizadas basadas en el Patrón AAA (Arrange, Act, Assert) enfocado en el núcleo de dominio de `alvas-sistema`.

## 1. Alcance de las Pruebas

En esta iteración (v1.0), el foco está en la **Pirámide de Pruebas**, concentrándonos en el 80% de base:

- **Pruebas Unitarias de Value Objects:** Asegurar validación estricta al instanciar.
- **Pruebas de Invariantes en Aggregate Roots:** Asegurar que ninguna entidad pueda pasar a un estado inválido según las reglas de negocio.
- **Pruebas de Casos de Uso con fakes in-memory:** Validar orquestación de aplicación sin base de datos, HTTP ni framework.
- **Pruebas BDD (Caja Negra):** Validar flujos de negocio desde una testing API estable utilizando Gherkin.

## 2. Ubicación de la Suite

```text
apps/api/test/
  unit/
    application/
    domain/
  bdd/
    features/
      step_definitions/
```

Los tests son una suite técnica del servicio `apps/api`, no un bounded context. Por eso viven fuera de `src/lib`, manteniendo separadas las capas productivas (`domain`, `application`, `infrastructure`) de la evidencia de aseguramiento.

## 3. Herramientas Utilizadas

- **Test Runner:** `bun test` (Para tests unitarios, dado que es nativo y ultra-rápido).
- **BDD Framework:** `@cucumber/cucumber` junto con `tsx` para interpretar los `step_definitions` en TypeScript.

## 4. Matriz de Pruebas Priorizadas (S05/S06)

| Componente                                                          | Tipo de Prueba           | Criterio de Aceptación (Invariante)                                             | Estado          |
| :------------------------------------------------------------------ | :----------------------- | :------------------------------------------------------------------------------ | :-------------- |
| `EstadoLead` (VO)                                                   | Unitaria                 | Debe rechazar cualquier string que no pertenezca al enum.                       | ✅ Implementado |
| `TipoVenta` (VO)                                                    | Unitaria                 | Debe normalizar valores (trim, uppercase) y rechazar inválidos.                 | ✅ Implementado |
| `Username`, `Nombre`, `Rol`, `EstadoUsuario` (VOs)                  | Unitaria                 | Deben normalizar valores y rechazar estados fuera del lenguaje ubicuo.          | ✅ Implementado |
| `AuthToken`, `RefreshToken` (VOs)                                   | Unitaria                 | Deben rechazar tokens vacíos.                                                   | ✅ Implementado |
| `CanalCaptacion`, `OrigenCaptacion`, `DatosContactoCaptacion` (VOs) | Unitaria                 | Deben normalizar canal/origen/contacto y rechazar datos obligatorios vacíos.    | ✅ Implementado |
| `PorcentajeConversion` (VO)                                         | Unitaria                 | Debe calcular porcentaje derivado y proteger divisiones por cero.               | ✅ Implementado |
| `Usuario` (Agregado)                                                | Unitaria                 | Nace activo y no puede deshabilitarse dos veces.                                | ✅ Implementado |
| `Lead` (Agregado)                                                   | Unitaria                 | No debe permitir agendar citas si el Lead tiene estado PERDIDO o CONVERTIDO.    | ✅ Implementado |
| `Lead` (Agregado)                                                   | Unitaria                 | No debe permitir convertir un Lead que ya se encuentra convertido.              | ✅ Implementado |
| `Sesion` (Entidad)                                                  | Unitaria                 | Debe exponer tokens y datos de usuario autenticado.                             | ✅ Implementado |
| `Cita` (Entidad)                                                    | Unitaria                 | Debe validar rangos de fecha y no reprogramar citas realizadas.                 | ✅ Implementado |
| `Contrato` (Agregado)                                               | Unitaria                 | Debe iniciar en BORRADOR y solo firmarse desde ese estado.                      | ✅ Implementado |
| `Captacion` (Agregado)                                              | Unitaria                 | Debe normalizar canal/tipo/contacto y generar email local si falta correo.      | ✅ Implementado |
| `EvaluadorAsignacionService` (Domain Service)                       | Unitaria                 | Debe elegir el asesor con menor carga y fallar si no hay asesores.              | ✅ Implementado |
| `CrearUsuarioUseCase`                                               | Aplicación con fake repo | Debe guardar usuario con hash y rechazar duplicados.                            | ✅ Implementado |
| `IniciarSesionUseCase`                                              | Aplicación con fakes     | Debe emitir tokens con credenciales válidas y rechazar usuarios deshabilitados. | ✅ Implementado |
| `AgendarCitaUseCase`                                                | Aplicación con fake repo | Debe agregar cita al lead y registrar actividad.                                | ✅ Implementado |
| `ConvertirLeadAClienteUseCase`                                      | Aplicación con fake repo | Debe crear cliente y cerrar lead.                                               | ✅ Implementado |
| `Captación` (BDD)                                                   | Comportamiento           | Si no hay asesores, falla y no se registra. Si los hay, se registra como NUEVO. | ✅ Implementado |
| `Agendar Cita` (BDD)                                                | Comportamiento           | Solo se pueden agendar citas si el lead está abierto.                           | ✅ Implementado |
| `Convertir Lead` (BDD)                                              | Comportamiento           | El cambio a estado CONVERTIDO debe reflejarse correctamente.                    | ✅ Implementado |

## 5. Ejecución de las Pruebas

```bash
# Ejecutar pruebas unitarias y de aplicación
bun test

# Ejecutar pruebas con cobertura
bun test --coverage

# Ejecutar pruebas de comportamiento (BDD)
bun --cwd apps/api test:bdd
```

## 6. Criterio de Cobertura

La cobertura se interpreta como evidencia de blindaje del núcleo probado, no como garantía absoluta del backend completo. La suite prioriza reglas de dominio, invariantes y casos de uso de alto valor para la Semana 05. El reporte asociado está en `apps/api/coverage-report.md`.

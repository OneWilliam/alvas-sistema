# Plan de Pruebas (Test Plan) v1.0 - Semana 05

Este documento define la estrategia de aseguramiento de calidad (QA) y pruebas automatizadas basadas en el Patrón AAA (Arrange, Act, Assert) enfocado en el núcleo de dominio de `alvas-sistema`.

## 1. Alcance de las Pruebas
En esta iteración (v1.0), el foco está en la **Pirámide de Pruebas**, concentrándonos en el 80% de base:
- **Pruebas Unitarias de Value Objects:** Asegurar la inmutabilidad y validación estricta al instanciar.
- **Pruebas de Invariantes en Aggregate Roots:** Asegurar que ninguna entidad pueda pasar a un estado inválido según las reglas de negocio.
- **Pruebas BDD (Caja Negra):** Validar los Casos de Uso desde el punto de vista del usuario final utilizando Gherkin.

## 2. Herramientas Utilizadas
- **Test Runner:** `bun test` (Para tests unitarios, dado que es nativo y ultra-rápido).
- **BDD Framework:** `@cucumber/cucumber` junto con `tsx` para interpretar los `step_definitions` en TypeScript.

## 3. Matriz de Pruebas Priorizadas (S05/S06)

| Componente | Tipo de Prueba | Criterio de Aceptación (Invariante) | Estado |
| :--- | :--- | :--- | :--- |
| `EstadoLead` (VO) | Unitaria | Debe rechazar cualquier string que no pertenezca al enum. | ✅ Implementado |
| `TipoVenta` (VO) | Unitaria | Debe normalizar valores (trim, uppercase) y rechazar inválidos. | ✅ Implementado |
| `Lead` (Agregado) | Unitaria | No debe permitir agendar citas si el Lead tiene estado PERDIDO o CONVERTIDO. | ✅ Implementado |
| `Lead` (Agregado) | Unitaria | No debe permitir convertir un Lead que ya se encuentra convertido. | ✅ Implementado |
| `Captación` (BDD) | Comportamiento | Si no hay asesores, falla y no se registra. Si los hay, se registra como NUEVO. | ✅ Implementado |
| `Agendar Cita` (BDD) | Comportamiento | Solo se pueden agendar citas si el lead está abierto. | ✅ Implementado |
| `Convertir Lead` (BDD) | Comportamiento | El cambio a estado CONVERTIDO debe reflejarse correctamente. | ✅ Implementado |

## 4. Ejecución de las Pruebas
```bash
# Ejecutar pruebas unitarias puras (Dominio)
bun test

# Ejecutar pruebas de comportamiento (BDD)
bun test:bdd
```

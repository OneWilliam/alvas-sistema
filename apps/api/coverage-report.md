# Reporte de Cobertura - Semana 05

## Comandos Ejecutados

```bash
bun test --coverage
bun run typecheck
bun --cwd apps/api test:bdd
```

## Alcance Cubierto

- Value Objects de `usuarios`, `auth`, `ventas`, `integraciones` y `reportes`.
- Entidades/agregados: `Usuario`, `Sesion`, `Lead`, `Cita`, `Contrato`, `Captacion`.
- Servicio de dominio: `EvaluadorAsignacionService`.
- Casos de uso con fakes in-memory: `CrearUsuarioUseCase`, `IniciarSesionUseCase`, `AgendarCitaUseCase`, `ConvertirLeadAClienteUseCase`.
- Escenarios BDD para captación de leads, agendamiento de cita y conversión de lead a cliente.

## Resultado Actual

```text
bun test --coverage
29 pass
0 fail
77 expect() calls
All files: 86.20% funcs, 91.66% lines

bun --cwd apps/api test:bdd
6 scenarios passed
20 steps passed

bun run typecheck
OK

bun run lint
OK
```

## Lectura de la Cobertura

`bun test --coverage` reporta cobertura sobre los módulos cargados por la suite. Por eso la métrica no debe interpretarse como cobertura total de todo el backend, sino como cobertura del núcleo de dominio y aplicación seleccionado para el blindaje de Semana 05.

## Evidencia Esperada

La ejecución debe finalizar con:

- Tests unitarios y de aplicación en verde.
- Typecheck en verde.
- Escenarios BDD en verde.

Actualizar este archivo si se agregan nuevos bounded contexts, casos de uso o reglas de dominio críticas.

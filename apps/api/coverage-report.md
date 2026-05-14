# Reporte de Cobertura

## Comandos Ejecutados

```bash
bun test --coverage
bun run typecheck
bun run lint
```

## Alcance Cubierto

- Tests unitarios organizados por contexto en `apps/api/test/unit/{auth,usuarios,ventas,integraciones,reportes}`.
- Value Objects de `usuarios`, `auth`, `ventas`, `integraciones` y `reportes`.
- Entidades/agregados: `Usuario`, `Sesion`, `Lead`, `Cita`, `Contrato`, `Captacion`.
- Servicio de dominio: `EvaluadorAsignacionService`.
- Casos de uso con fakes in-memory: `CrearUsuarioUseCase`, `IniciarSesionUseCase`, `AgendarCitaUseCase`, `ConvertirLeadAClienteUseCase`.
- Mocks/spies con `mock()` de Bun para verificar interacciones con puertos de salida.

## Resultado Actual

```text
bun test --coverage
29 pruebas pasan
0 pruebas fallan
79 expect() calls
15 archivos de prueba
Cobertura total reportada: 86.72% funciones, 92.00% lineas

bun run typecheck
Pasa

bun run lint
Pasa
```

## Lectura de la Cobertura

`bun test --coverage` reporta cobertura sobre los módulos cargados por la suite. Por eso la métrica no debe interpretarse como cobertura total de todo el backend, sino como cobertura del núcleo de dominio y aplicación seleccionado para el blindaje de Semana 05.

## Evidencia Esperada

La ejecución debe finalizar con:

- Tests unitarios y de aplicación en verde.
- Typecheck en verde.
- Lint en verde.

Actualizar este archivo si se agregan nuevos bounded contexts, casos de uso o reglas de dominio críticas.

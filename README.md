# alvas-sistema

Base inicial del monorepo ALVAS alineada al plan tecnico DDD + Hexagonal.

## Objetivo tecnico

Reorganizar ALVAS de forma incremental, sin romper el MVP, con arquitectura modular por contexto y reglas claras de dependencias.

## Estructura

- `apps/api`: backend Hono sobre Cloudflare Workers.
- `apps/web`: placeholder para frontend Svelte.
- `packages/shared-types`: tipos compartidos del dominio.
- `packages/shared-utils`: utilidades compartidas.

Estructura objetivo del backend:

```text
apps/api/src/lib/<modulo>/
  domain/
  application/
  infrastructure/
```

Modulos base definidos: `shared`, `usuarios`, `auth`, `propiedades`, `ventas`, `reportes`, `integraciones`.

## Convenciones DDD + Hexagonal

1. `domain` no depende de infraestructura.
2. `application` no depende de framework HTTP ni ORM.
3. `infrastructure` implementa puertos del dominio/aplicacion.
4. Entre modulos, consumir contratos publicos; evitar imports internos por paths profundos.

## Regla de idioma

- Dominio y aplicacion: espanol (lenguaje ubicuo de negocio).
- Nombres de clases, funciones y casos de uso del negocio: español.
- Carpetas y artefactos tecnicos pueden mantenerse en ingles.
- Terminos tecnicos de borde se mantienen en ingles: `Controller`, `Repository`, `DTO`, `Mapper`, `Middleware`, `Adapter`, `Port`.

## Regla de DTOs

- DTOs de request/response usan tipos primitivos y estructuras serializables.
- No exponer entidades o value objects del dominio en DTOs HTTP.
- Flujo esperado:
  `Http Request DTO -> Use Case -> Domain Entity/VO -> Repository -> Persistence -> Http Response DTO`.

## Regla de errores

- `shared` define errores base y estructura comun (`ErrorDeDominio`, `codigo`, `detalle`).
- Cada modulo define errores propios en su dominio (ejemplo: `UsuarioNoEncontradoError`).
- Infraestructura/HTTP mapea errores de dominio a 4xx y errores tecnicos a 5xx.

## Comandos

```bash
bun install
bun run dev:api
bun run dev:web
bun test
bun run lint
bun run typecheck
```

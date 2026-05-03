# alvas-sistema

Base inicial del monorepo ALVAS alineada al plan tecnico DDD + Hexagonal.

## Estructura

- `apps/api`: backend Hono sobre Cloudflare Workers.
- `apps/web`: placeholder para frontend Svelte.
- `packages/shared-types`: tipos compartidos del dominio.
- `packages/shared-utils`: utilidades compartidas.

## Comandos

```bash
bun install
bun run dev:api
bun run dev:web
bun test
```

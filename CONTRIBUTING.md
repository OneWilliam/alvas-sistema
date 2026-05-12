# Contributing

Este documento define el flujo de trabajo del repo: ramas, ambientes, validaciones, despliegues, migraciones y reglas operativas.

## Flujo De Ramas

- `feature/*`: ramas de trabajo para cambios concretos.
- `develop`: rama continua. Todo merge aqui despliega a `staging`.
- `main`: rama estable. Todo merge aqui despliega a `production`.

Regla principal: no trabajar directo sobre `main`. `main` representa production.

Flujo normal:

1. Crear una rama `feature/*` desde `develop`.
2. Abrir PR hacia `develop`.
3. Ejecutar checks: install, lint, typecheck y tests cuando existan.
4. Merge a `develop`.
5. Deploy automatico a `staging`.
6. Validar smoke tests y flujos reales en staging.
7. Abrir PR de `develop` hacia `main` para liberar.
8. Merge a `main`.
9. Deploy automatico a `production`.

Comando util para preparar release:

```bash
git switch develop
git pull origin develop
gh pr create --base main --head develop --title "Release staging to production" --body "Promueve cambios probados en staging a production."
```

Si alguna vez se necesita que `main` quede exactamente igual a `develop`, puede hacerse como correccion puntual:

```bash
git switch develop
git push --force-with-lease origin develop:main
```

No usar ese comando como flujo normal de release.

## Ambientes

- `local/dev`: desarrollo local con `wrangler dev` y D1 local o `alvas-dev`.
- `staging`: preproduccion remota. Worker `alvas-api-staging`, DB `alvas-staging`.
- `production`: ambiente real. Worker `alvas-api-production`, DB `alvas-main`.

Regla operativa:

- PR valida codigo.
- `develop` valida infraestructura real en staging.
- `main` libera production.

## Cloudflare Workers

Worker staging:

- Nombre: `alvas-api-staging`
- Rama: `develop`
- Root directory: `/apps/api/`
- Build command: vacio, salvo que Cloudflare exija uno.
- Deploy command: `bunx wrangler deploy --env staging`
- Binding `DB`: `alvas-staging`

Worker production:

- Nombre: `alvas-api-production`
- Rama: `main`
- Root directory: `/apps/api/`
- Build command: vacio, salvo que Cloudflare exija uno.
- Deploy command: `bunx wrangler deploy --env production`
- Binding `DB`: `alvas-main`

Si Cloudflare exige build command:

```bash
bun install --frozen-lockfile
```

Non-production branch deploy debe estar desactivado al inicio para backend con D1, salvo que exista una DB preview aislada.

## Pages Futuro

Cuando exista frontend desplegado en Cloudflare Pages:

- Pages staging/preview debe apuntar a API staging.
- Pages production debe apuntar a API production.
- Las previews de Pages nunca deben consumir production si pueden ejecutar flujos que escriben datos.

## Secrets

No guardar secretos reales en `wrangler.toml` ni en el repo.

`apps/api/.dev.vars` funciona como el `.env` local de Cloudflare Workers. Wrangler lo lee automaticamente al ejecutar `wrangler dev` desde `apps/api`:

```bash
bun --cwd apps/api wrangler dev
```

Ese archivo es solo para desarrollo local y debe permanecer ignorado por Git.

Secrets actuales por ambiente:

- `AUTH_SECRET`: firma/verifica access tokens.
- `AUTH_REFRESH_SECRET`: firma/verifica refresh tokens.
- `AUTH_PEPPER`: se mezcla con passwords antes de PBKDF2.

Cada ambiente debe tener valores distintos:

- local
- staging
- production

Configurar secrets remotos con Wrangler:

```bash
bun --cwd apps/api wrangler secret put AUTH_SECRET --env staging
bun --cwd apps/api wrangler secret put AUTH_REFRESH_SECRET --env staging
bun --cwd apps/api wrangler secret put AUTH_PEPPER --env staging

bun --cwd apps/api wrangler secret put AUTH_SECRET --env production
bun --cwd apps/api wrangler secret put AUTH_REFRESH_SECRET --env production
bun --cwd apps/api wrangler secret put AUTH_PEPPER --env production
```

`AUTH_PEPPER` es especialmente sensible: cambiarlo invalida passwords generadas con el pepper anterior.

## Migraciones D1

PR:

- No ejecutar migraciones remotas.
- Validar codigo y lockfile.

Staging:

- Aplicar migraciones a `alvas-staging`.
- Desplegar `alvas-api-staging`.
- Ejecutar smoke tests.

Production:

- Aprobar release desde `develop` hacia `main`.
- Hacer backup/export o punto de recuperacion antes de migrar.
- Aplicar migraciones a `alvas-main`.
- Desplegar `alvas-api-production`.
- Ejecutar smoke tests de production.

Preferir migraciones compatibles hacia adelante:

- Agregar primero columnas/tablas nuevas.
- Desplegar codigo compatible.
- Ejecutar backfill si aplica.
- Endurecer constraints o eliminar campos en una migracion posterior.

## Backups

Antes de migraciones productivas:

- Usar Time Travel de D1 cuando aplique.
- Crear export SQL si el cambio es riesgoso.
- Guardar el export como artefacto del pipeline o en storage seguro.

Export real de production:

```bash
bun --cwd apps/api wrangler d1 export alvas-main --remote --output ../../backups/alvas-main-YYYYMMDD-HHMM.sql
```

Export real de staging:

```bash
bun --cwd apps/api wrangler d1 export alvas-staging --remote --output ../../backups/alvas-staging-YYYYMMDD-HHMM.sql
```

Consultar Time Travel:

```bash
bun --cwd apps/api wrangler d1 time-travel info alvas-main
```

Restaurar con Time Travel:

```bash
bun --cwd apps/api wrangler d1 time-travel restore alvas-main
```

## Checks Locales

Antes de abrir PR o liberar:

```bash
bun install --frozen-lockfile
bun run lint
bun run typecheck
```

Tests se agregaran cuando el proyecto lo requiera formalmente.

## Reglas De Arquitectura

- No importar entidades, repositorios ni value objects internos de otro bounded context.
- Cruzar contextos mediante puertos del consumidor y adapters.
- Mantener `apps/api/src/composition` como composition root.
- Mantener controllers delgados.
- Poner reglas de negocio profundas en dominio, no en controllers ni adapters.
- Actualizar `ARCHITECTURE.md` cuando cambien bounded contexts, puertos, adapters, ACLs o ciclos de vida.

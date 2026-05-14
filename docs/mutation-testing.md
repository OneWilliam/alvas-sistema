# Mutation Testing

Mutation testing valida la calidad de la suite de pruebas inyectando defectos pequenos en el codigo de produccion y verificando si los tests fallan. Una suite puede tener alta cobertura de lineas y aun asi ser debil si sus aserciones no detectan esos defectos.

## Comandos

```bash
bun install
bun run test:mutation:dry-run
bun run test:mutation
```

Usa primero `bun run test:mutation:dry-run`. Ese comando confirma que Stryker puede copiar el proyecto a su sandbox y ejecutar los tests configurados con Bun sin crear mutantes.

## Alcance

La configuracion de Stryker muta codigo de negocio bajo:

- `apps/api/src/lib/*/domain/**/*.ts`
- `apps/api/src/lib/*/application/**/*.ts`

Excluye tests, DTOs, puertos e `index.ts`. El objetivo es evaluar aserciones sobre comportamiento de dominio y casos de uso, no codigo de pegado de frameworks.

## Como leer resultados

- `Killed`: al menos un test fallo despues de que Stryker inyecto el defecto. Es el resultado deseado.
- `Survived`: todos los tests pasaron despues del defecto. Normalmente significa que los tests ejecutan el codigo, pero no validan el comportamiento con suficiente precision.
- `No Coverage`: el codigo mutado no fue ejecutado por el comando de tests configurado.
- `Timeout`: la mutacion probablemente genero una ruta lenta o infinita.
- `Equivalent`: la mutacion cambio la sintaxis, pero no el comportamiento observable. Estos casos requieren revision manual y documentacion.

## Ciclo de revision

1. Ejecuta `bun run test:mutation`.
2. Abre `reports/mutation/index.html`.
3. Empieza por mutantes `Survived` y `No Coverage` en objetos de dominio y casos de uso.
4. Agrega o endurece tests sobre limites de negocio, estados invalidos y valores esperados.
5. Ejecuta mutation testing otra vez y compara el mutation score.

No persigas 100% a ciegas. Trata los mutantes sobrevivientes como evidencia para inspeccionar. Algunos son brechas reales; otros pueden ser mutantes equivalentes o ramas intencionalmente poco relevantes.

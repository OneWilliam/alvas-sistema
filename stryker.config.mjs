// @ts-check

/**
 * El mutation testing queda acotado a codigo de negocio. Controllers,
 * adaptadores de persistencia, DTOs, puertos e index.ts meten ruido sin
 * validar comportamiento de dominio.
 *
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  testRunner: 'command',
  commandRunner: {
    command: 'bun test',
  },
  mutate: [
    'apps/api/src/lib/{auth,usuarios,ventas,integraciones,reportes,propiedades}/domain/**/*.ts',
    'apps/api/src/lib/{auth,usuarios,ventas,integraciones,reportes,propiedades}/application/**/*.ts',
    '!apps/api/src/**/*.test.ts',
    '!apps/api/src/**/dto/**/*.ts',
    '!apps/api/src/**/ports/**/*.ts',
    '!apps/api/src/**/index.ts',
  ],
  reporters: ['progress', 'clear-text', 'html', 'json'],
  coverageAnalysis: 'off',
  concurrency: 2,
  timeoutMS: 10000,
  thresholds: {
    high: 80,
    low: 60,
    break: null,
  },
  htmlReporter: {
    fileName: 'reports/mutation/index.html',
  },
  jsonReporter: {
    fileName: 'reports/mutation/mutation.json',
  },
};

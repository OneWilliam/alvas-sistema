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

`bun test --coverage` reporta cobertura sobre los módulos cargados por la suite. Por eso la métrica no debe interpretarse como cobertura total de todo el backend, sino como cobertura del núcleo de dominio y aplicación seleccionado para el blindaje.

## Evidencia Esperada

La ejecución debe finalizar con:

- Tests unitarios y de aplicación en verde.
- Typecheck en verde.
- Lint en verde.

Actualizar este archivo si se agregan nuevos bounded contexts, casos de uso o reglas de dominio críticas.


Output:

bun test --coverage
bun test v1.3.13 (bf2e2cec)

apps\api\test\unit\auth\auth-token.test.ts:
✓ auth / value objects > AuthToken y RefreshToken protegen valores obligatorios

apps\api\test\unit\auth\iniciar-sesion.usecase.test.ts:
✓ auth / IniciarSesionUseCase > emite tokens para credenciales validas
✓ auth / IniciarSesionUseCase > rechaza usuarios deshabilitados

apps\api\test\unit\auth\sesion.test.ts:
✓ auth / Sesion > expone tokens y usuario autenticado

apps\api\test\unit\integraciones\captacion.test.ts:
✓ integraciones / Captacion > normaliza canal, origen y datos de contacto
✓ integraciones / Captacion > normaliza entrada y genera email local si falta correo

apps\api\test\unit\reportes\porcentaje-conversion.test.ts:
✓ reportes / PorcentajeConversion > calcula porcentaje derivado y evita divisiones por cero

apps\api\test\unit\usuarios\crear-usuario.usecase.test.ts:
✓ usuarios / CrearUsuarioUseCase > guarda usuario con hash generado [15.00ms]
✓ usuarios / CrearUsuarioUseCase > rechaza usernames duplicados

apps\api\test\unit\usuarios\usuario-value-objects.test.ts:
✓ usuarios / value objects > Username normaliza y valida formato [16.00ms]
✓ usuarios / value objects > Nombre recorta espacios y rechaza valores vacios
✓ usuarios / value objects > Rol y EstadoUsuario aceptan solo valores del lenguaje ubicuo

apps\api\test\unit\usuarios\usuario.test.ts:
✓ usuarios / Usuario > nace activo y protege deshabilitacion duplicada

apps\api\test\unit\ventas\cita.test.ts:
✓ ventas / Cita > protege fechas y cambios invalidos

apps\api\test\unit\ventas\contrato.test.ts:
✓ ventas / Contrato > inicia en borrador y solo se firma una vez

apps\api\test\unit\ventas\evaluador-asignacion.test.ts:
✓ ventas / EvaluadorAsignacionService > elige el asesor con menor carga de leads [16.00ms]
✓ ventas / EvaluadorAsignacionService > falla si no hay asesores disponibles

apps\api\test\unit\ventas\ventas-use-cases.test.ts:
✓ ventas / use cases > AgendarCitaUseCase agrega cita al lead y registra actividad [78.00ms]
✓ ventas / use cases > ConvertirLeadAClienteUseCase crea cliente y cierra lead

apps\api\src\lib\ventas\domain\entities\Lead.test.ts:
✓ Agregado de Dominio: Gestión de Leads > Debe registrar un nuevo lead con estado inicial NUEVO
✓ Agregado de Dominio: Gestión de Leads > Debe proteger la invariante: No se puede agendar cita en un lead cerrado
✓ Agregado de Dominio: Gestión de Leads > Debe proteger la invariante: No se puede convertir a cliente un lead ya convertido

apps\api\src\lib\ventas\domain\value-objects\EstadoLead.test.ts:
✓ Value Object: EstadoLead > Debe crear un estado válido de las opciones disponibles
✓ Value Object: EstadoLead > Debe lanzar ErrorDeValidacion si el estado es inválido
✓ Value Object: EstadoLead > Debe identificar si un estado está cerrado
✓ Value Object: EstadoLead > Debe retornar instancias correctas desde métodos factoría estáticos

apps\api\src\lib\ventas\domain\value-objects\TipoVenta.test.ts:
✓ Value Object: TipoVenta > Debe crear un tipo válido (VENTA)
✓ Value Object: TipoVenta > Debe crear un tipo válido (COMPRA) ignorando mayusculas/minusculas y espacios
✓ Value Object: TipoVenta > Debe lanzar ErrorDeDominio si el tipo es inválido
-------------------------------------------------------------------------------|---------|---------|-------------------
File                                                                           | % Funcs | % Lines | Uncovered Line #s
-------------------------------------------------------------------------------|---------|---------|-------------------
All files                                                                      |   86.72 |   92.00 |
 apps\api\src\lib\auth\application\use-cases\IniciarSesionUseCase.ts           |  100.00 |  100.00 | 
 apps\api\src\lib\auth\domain\entities\Sesion.ts                               |  100.00 |  100.00 | 
 apps\api\src\lib\auth\domain\entities\index.ts                                |  100.00 |  100.00 | 
 apps\api\src\lib\auth\domain\errors\AuthTokenInvalidoError.ts                 |    0.00 |   42.86 | 4-7
 apps\api\src\lib\auth\domain\errors\CredencialesInvalidasError.ts             |  100.00 |  100.00 | 
 apps\api\src\lib\auth\domain\errors\RefreshTokenInvalidoError.ts              |  100.00 |  100.00 | 
 apps\api\src\lib\auth\domain\errors\index.ts                                  |  100.00 |  100.00 | 
 apps\api\src\lib\auth\domain\index.ts                                         |  100.00 |  100.00 | 
 apps\api\src\lib\auth\domain\ports\IConsultaCredencialesUsuario.ts            |  100.00 |  100.00 | 
 apps\api\src\lib\auth\domain\ports\ITokenProvider.ts                          |  100.00 |  100.00 | 
 apps\api\src\lib\auth\domain\ports\IVerificadorDeClave.ts                     |  100.00 |  100.00 | 
 apps\api\src\lib\auth\domain\ports\index.ts                                   |  100.00 |  100.00 | 
 apps\api\src\lib\auth\domain\value-objects\AuthToken.ts                       |  100.00 |  100.00 | 
 apps\api\src\lib\auth\domain\value-objects\RefreshToken.ts                    |  100.00 |  100.00 | 
 apps\api\src\lib\auth\domain\value-objects\RolAcceso.ts                       |  100.00 |  100.00 | 
 apps\api\src\lib\auth\domain\value-objects\index.ts                           |  100.00 |  100.00 | 
 apps\api\src\lib\integraciones\domain\entities\Captacion.ts                   |   55.56 |   60.98 | 44-51,56-63
 apps\api\src\lib\integraciones\domain\value-objects\CanalCaptacion.ts         |  100.00 |  100.00 | 
 apps\api\src\lib\integraciones\domain\value-objects\DatosContactoCaptacion.ts |  100.00 |  100.00 | 
 apps\api\src\lib\integraciones\domain\value-objects\OrigenCaptacion.ts        |  100.00 |  100.00 | 
 apps\api\src\lib\integraciones\domain\value-objects\index.ts                  |  100.00 |  100.00 | 
 apps\api\src\lib\reportes\domain\value-objects\PorcentajeConversion.ts        |  100.00 |  100.00 | 
 apps\api\src\lib\shared\application\CasoDeUso.ts                              |  100.00 |  100.00 | 
 apps\api\src\lib\shared\application\Resultado.ts                              |  100.00 |  100.00 | 
 apps\api\src\lib\shared\application\index.ts                                  |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\errors\ErrorDeDominio.ts                       |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\errors\ErrorDeValidacion.ts                    |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\errors\index.ts                                |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\index.ts                                       |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\ports\IGeneradorId.ts                          |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\ports\IReloj.ts                                |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\ports\IRepositorioEscritura.ts                 |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\ports\IRepositorioLectura.ts                   |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\ports\index.ts                                 |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\types\Marca.ts                                 |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\types\Nulo.ts                                  |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\types\Primitivo.ts                             |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\types\Roles.ts                                 |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\types\index.ts                                 |  100.00 |  100.00 | 
 apps\api\src\lib\shared\domain\value-objects\IdUsuarioRef.ts                  |  100.00 |  100.00 | 
 apps\api\src\lib\shared\index.ts                                              |  100.00 |  100.00 | 
 apps\api\src\lib\usuarios\application\use-cases\CrearUsuarioUseCase.ts        |  100.00 |  100.00 | 
 apps\api\src\lib\usuarios\domain\entities\Usuario.ts                          |   43.75 |   52.33 | 72-88,93-96,101-104,113-120,124-125,129-130,134-135,139-140
 apps\api\src\lib\usuarios\domain\entities\index.ts                            |  100.00 |  100.00 | 
 apps\api\src\lib\usuarios\domain\errors\EstadoUsuarioInvalidoError.ts         |  100.00 |  100.00 | 
 apps\api\src\lib\usuarios\domain\errors\HashClaveUsuarioInvalidaError.ts      |    0.00 |   42.86 | 4-7
 apps\api\src\lib\usuarios\domain\errors\IdUsuarioInvalidoError.ts             |    0.00 |   37.50 | 4-8
 apps\api\src\lib\usuarios\domain\errors\RolDeUsuarioInvalidoError.ts          |  100.00 |  100.00 | 
 apps\api\src\lib\usuarios\domain\errors\UsuarioNoEncontradoError.ts           |    0.00 |   33.33 | 4-9
 apps\api\src\lib\usuarios\domain\errors\UsuarioYaDeshabilitadoError.ts        |  100.00 |  100.00 | 
 apps\api\src\lib\usuarios\domain\errors\UsuarioYaExisteError.ts               |  100.00 |  100.00 | 
 apps\api\src\lib\usuarios\domain\errors\index.ts                              |  100.00 |  100.00 | 
 apps\api\src\lib\usuarios\domain\value-objects\EstadoUsuario.ts               |  100.00 |  100.00 | 
 apps\api\src\lib\usuarios\domain\value-objects\HashClave.ts                   |  100.00 |  100.00 | 
 apps\api\src\lib\usuarios\domain\value-objects\IdUsuario.ts                   |   50.00 |   86.67 | 20
 apps\api\src\lib\usuarios\domain\value-objects\Nombre.ts                      |   66.67 |   93.75 | 
 apps\api\src\lib\usuarios\domain\value-objects\Rol.ts                         |   75.00 |   94.12 | 
 apps\api\src\lib\usuarios\domain\value-objects\Username.ts                    |   66.67 |   95.24 | 
 apps\api\src\lib\usuarios\domain\value-objects\index.ts                       |  100.00 |  100.00 | 
 apps\api\src\lib\ventas\application\use-cases\AgendarCitaUseCase.ts           |  100.00 |  100.00 | 
 apps\api\src\lib\ventas\application\use-cases\ConvertirLeadAClienteUseCase.ts |  100.00 |  100.00 | 
 apps\api\src\lib\ventas\domain\entities\Cita.ts                               |   41.18 |   42.70 | 27-42,46-48,59-64,88,92,96-119
 apps\api\src\lib\ventas\domain\entities\Cliente.ts                            |   25.00 |   36.59 | 35,40-60,64-67
 apps\api\src\lib\ventas\domain\entities\Contrato.ts                           |   35.71 |   56.14 | 43-59,63-68,80-81
 apps\api\src\lib\ventas\domain\entities\Lead.test.ts                          |  100.00 |  100.00 | 
 apps\api\src\lib\ventas\domain\entities\Lead.ts                               |   51.85 |   40.00 | 55,81-83,87-92,118,122-124,128-130,134-136,140-144,148-149,153-154,158-195,199-230
 apps\api\src\lib\ventas\domain\services\EvaluadorAsignacion.ts                |   66.67 |   87.50 | 27-28
 apps\api\src\lib\ventas\domain\value-objects\EstadoLead.test.ts               |  100.00 |  100.00 | 
 apps\api\src\lib\ventas\domain\value-objects\EstadoLead.ts                    |   55.56 |  100.00 | 
 apps\api\src\lib\ventas\domain\value-objects\Ids.ts                           |  100.00 |  100.00 | 
 apps\api\src\lib\ventas\domain\value-objects\TipoVenta.test.ts                |  100.00 |  100.00 | 
 apps\api\src\lib\ventas\domain\value-objects\TipoVenta.ts                     |   50.00 |   87.50 | 21
 apps\api\test\unit\auth\auth-token.test.ts                                    |  100.00 |  100.00 | 
 apps\api\test\unit\auth\iniciar-sesion.usecase.test.ts                        |   73.33 |   91.67 | 14-16,42
 apps\api\test\unit\auth\sesion.test.ts                                        |  100.00 |  100.00 | 
 apps\api\test\unit\integraciones\captacion.test.ts                            |  100.00 |  100.00 | 
 apps\api\test\unit\reportes\porcentaje-conversion.test.ts                     |  100.00 |  100.00 | 
 apps\api\test\unit\usuarios\crear-usuario.usecase.test.ts                     |   70.59 |   80.26 | 12-14,23-30,48-51
 apps\api\test\unit\usuarios\usuario-value-objects.test.ts                     |  100.00 |  100.00 | 
 apps\api\test\unit\usuarios\usuario.test.ts                                   |  100.00 |  100.00 | 
 apps\api\test\unit\ventas\cita.test.ts                                        |  100.00 |  100.00 | 
 apps\api\test\unit\ventas\contrato.test.ts                                    |  100.00 |  100.00 | 
 apps\api\test\unit\ventas\evaluador-asignacion.test.ts                        |  100.00 |  100.00 | 
 apps\api\test\unit\ventas\ventas-use-cases.test.ts                            |   57.14 |   66.34 | 35-50,55-62,67-76
-------------------------------------------------------------------------------|---------|---------|-------------------

 29 pass
 0 fail
 79 expect() calls
Ran 29 tests across 15 files. [770.00ms]

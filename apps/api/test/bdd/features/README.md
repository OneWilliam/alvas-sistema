# Especificaciones Ejecutables BDD

Este directorio contiene escenarios Gherkin vinculados al MVP del servicio `apps/api`. Los escenarios describen comportamiento de negocio y se ejecutan contra casos de uso o reglas de dominio expuestas por el nucleo de la arquitectura hexagonal.

## Estructura

```text
apps/api/test/bdd/features
├── agendar_cita.feature
├── captacion_leads.feature
├── convertir_cliente.feature
└── step_definitions
    ├── agendar_cita.steps.ts
    ├── captacion_leads.steps.ts
    └── convertir_cliente.steps.ts
```

## Matriz de Vinculacion Arquitectonica

| Escenario | Puerto primario invocado | Componente ejercitado | Tecnica SWEBOK aplicada |
| :--- | :--- | :--- | :--- |
| Agendar cita exitosamente | `IAgendarCita` / `AgendarCitaUseCase` | Caso de uso + agregado `Lead` + entidad `Cita` | Caja negra sobre contrato de entrada/salida |
| Fallo al agendar cita en lead cerrado | `IAgendarCita` / `AgendarCitaUseCase` | Caso de uso + invariante de `Lead` | Caja negra con particion de estado invalido |
| Fallo de registro por falta de asesores | `IRegistrarLead` / `RegistrarLeadUseCase` | Caso de uso + `EvaluadorAsignacionService` | Caja negra con ruta excepcional |
| Registro exitoso de un lead calificado | `IRegistrarLead` / `RegistrarLeadUseCase` | Caso de uso + agregado `Lead` | Caja negra con camino feliz |
| Convertir lead a cliente exitosamente | `IConvertirLeadACliente` / `ConvertirLeadAClienteUseCase` | Caso de uso + agregado `Lead` + entidad `Cliente` | Caja negra sobre cambio de estado |
| Evitar convertir lead ya convertido | `IConvertirLeadACliente` / `ConvertirLeadAClienteUseCase` | Caso de uso + invariante de `Lead` | Caja negra con frontera de consistencia |

## Criterios Aplicados

- Los escenarios usan lenguaje del negocio: lead, asesor, cita, cliente, captacion y conversion.
- Los pasos no dependen de interfaz visual, DOM, SQL ni detalles de infraestructura.
- Los step definitions actuan como adaptador primario de pruebas.
- Las dependencias externas se sustituyen por fakes o stubs in-memory.
- Las reglas principales se validan desde los contratos de entrada y salida del hexagono.

## Ejecucion

```bash
bun --cwd apps/api test:bdd
```


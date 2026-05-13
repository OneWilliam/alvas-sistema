# ADR 0001: Adopción de Diseño Táctico (DDD)

## Estado
Aceptado

## Contexto
El sistema requiere gestionar un flujo complejo de ventas inmobiliarias (captación de leads, seguimiento de citas, y firma de contratos). Inicialmente, la lógica de negocio estaba dispersa en los Casos de Uso (Entidades Anémicas) y existía dependencia directa entre Casos de Uso (Ej. `EvaluarLeadParaAsignarUseCase` inyectado dentro de `RegistrarLeadUseCase`), lo cual viola las fronteras transaccionales y de diseño táctico propuestas por Evans y Vernon.

## Decisión
Hemos decidido adoptar de forma estricta los patrones de Diseño Táctico de DDD:
1. **Value Objects:** Se reemplazarán primitivos por Objetos de Valor inmutables (`EstadoLead`, `TipoVenta`, `Rol`) para encapsular las reglas de validación.
2. **Domain Services:** Toda lógica de negocio que no pertenezca a una única entidad (ej. consultar múltiples asesores para decidir una asignación) se modelará como un Servicio de Dominio (ej. `EvaluadorAsignacionService`), evitando inyectar Casos de Uso entre sí.
3. **Mappers de Infraestructura:** El modelo de dominio nunca retornará ni recibirá objetos crudos de la base de datos (Drizzle). Se implementará `VentasMapper` para aislar el dominio de la infraestructura.

## Consecuencias
- **Positivas:** El código del dominio ahora es "Architecturally Neutral" y 100% testeable sin base de datos ni frameworks (aislamiento puro).
- **Negativas:** Introduce una sobrecarga al tener que mapear los objetos desde Drizzle hacia Entidades puras y mantener un mayor número de archivos (Value Objects, Entities, Domain Services).

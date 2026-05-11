# Alvas API - Documentación Técnica

## Arquitectura

Este servicio sigue una arquitectura **Hexagonal (Ports & Adapters)** combinada con **Domain-Driven Design (DDD)**.

### Reglas de Dependencia

1. **Domain**: Es el núcleo. **No depende de nadie**. Contiene entidades, value objects, y puertos (interfaces).
2. **Application**: Contiene los casos de uso. Depende únicamente de `domain` y de los puertos definidos en otros bounded contexts.
3. **Infrastructure**: Implementa los puertos definidos en `domain` o `application`. Es el único lugar donde vive la lógica de frameworks (Hono, Drizzle, etc.).

### Estructura de Módulos (Bounded Contexts)

Cada módulo (citas, leads, propiedades, usuarios, auth) sigue esta estructura:

- `/domain`: Entidades, VOs, Errores específicos, Puertos.
- `/application`: Casos de uso, DTOs.
- `/infrastructure`: Adaptadores, Persistencia (Drizzle), HTTP (Controladores/Routers).

### Comandos Esenciales

| Comando                    | Descripción                                             |
| :------------------------- | :------------------------------------------------------ |
| `bun run dev`              | Inicia el entorno de desarrollo (Wrangler).             |
| `bun run db:generate`      | Genera archivos de migración SQL basados en el esquema. |
| `bun run db:migrate:local` | Aplica migraciones a la base de datos local (D1).       |
| `bun test`                 | Ejecuta los tests unitarios y de integración.           |

## Gestión de Errores

Se utiliza `ErrorDeDominio` como clase base. Cada contexto define su propia subclase (ej. `LeadError`, `PropiedadError`) para garantizar trazabilidad y contexto.

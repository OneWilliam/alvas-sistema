# Alvas-Sistema - Arquitectura y Gobierno

Este documento define las reglas de oro para mantener la integridad arquitectónica de **Alvas-Sistema**. El proyecto sigue una arquitectura **Hexagonal (Ports & Adapters)** con **Domain-Driven Design (DDD)**.

## 1. Reglas de Arquitectura (Bounded Contexts)

- **Aislamiento**: Cada contexto (`auth`, `usuarios`, `ventas`, `propiedades`, `shared`) es independiente. Un contexto no puede importar lógica de dominio de otro.
- **Comunicación**: Solo se permite la comunicación entre contextos mediante:
    - **Puertos**: Definidos en `domain/ports`.
    - **DTOs compartidos**: Ubicados en `packages/shared-types`.
- **Regla de Dependencia**:
    - `Domain` -> No tiene dependencias externas.
    - `Application` -> Depende de `domain` y puertos.
    - `Infrastructure` -> Depende de `application` y frameworks (Drizzle, Hono, etc.).

## 2. Convenciones de Codificación

### Estructura de Módulo
```text
/domain/
  /entities/     # Raíces de agregado y entidades
  /value-objects/# Tipos complejos y branded types
  /ports/        # Interfaces (Puertos secundarios)
  /errors/       # Excepciones específicas del dominio
/application/
  /use-cases/    # Lógica de orquestación
  /dto/          # Estructuras de entrada/salida
/infrastructure/
  /persistence/  # Esquemas Drizzle, Mappers, Repositorios
  /http/         # Controladores, Routers, Middlewares
```

### Gestión de Errores
- Todo error de negocio debe heredar de `ErrorDeDominio` (ubicado en `shared/domain`).
- Cada contexto debe definir su propia subclase (ej. `LeadError`, `PropiedadError`) para garantizar trazabilidad.

## 3. Gobierno y Tests
- **Test Unitarios**: Deben cubrir el 100% de la lógica en `domain` y `application`.
- **Test de Integración**: Se ejecutan contra el entorno `env.testing` en D1 para verificar el SQL generado por Drizzle.
- **Tipado**: Queda prohibido el uso de `any`. Toda inferencia debe ser estricta.

## 4. Gestión de Dependencias
- `packages/shared-types` es una zona libre de dependencias. Solo contiene tipos/interfaces.
- No instalar librerías de runtime (`hono`, `drizzle-orm`) en la raíz. Cada `package.json` de workspace debe ser autónomo.

## 5. Proceso de Evolución
Antes de añadir una nueva funcionalidad:
1. Crear el caso de uso en `application/use-cases`.
2. Definir los puertos necesarios en `domain/ports`.
3. Implementar adaptadores en `infrastructure`.
4. Registrar rutas en `infrastructure/http/Router`.

Feature: Captación de Leads
  Como Asesor Comercial
  Quiero que el sistema registre los nuevos leads que llegan
  Para no perder oportunidades de ventas

  Scenario: Fallo de registro por falta de asesores
    Given que el negocio no tiene asesores disponibles
    When un nuevo prospecto "Maria" con correo "maria@example.com" solicita informacion sobre ventas
    Then el sistema no lo registra y falla por falta de asesores

  Scenario: Registro exitoso de un lead calificado
    Given que el negocio tiene asesores disponibles
    When un nuevo prospecto "Maria" con correo "maria@example.com" solicita informacion sobre ventas
    Then el sistema lo registra como un nuevo lead
    And el estado inicial del lead es "NUEVO"

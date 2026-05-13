Feature: Captación de Leads
  Como Asesor Comercial
  Quiero que el sistema registre los nuevos leads que llegan
  Para no perder oportunidades de ventas

  Scenario: Registro exitoso de un lead calificado
    Given que el negocio no tiene asesores disponibles
    When un nuevo prospecto "Maria" con correo "maria@example.com" solicita informacion sobre ventas
    Then el sistema lo registra como un nuevo lead
    And el estado inicial del lead es "NUEVO"

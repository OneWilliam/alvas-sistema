Feature: Agendar Cita
  Como Asesor Comercial
  Quiero agendar una cita con un lead
  Para mostrarle una propiedad o discutir detalles

  Scenario: Agendar cita exitosamente
    Given un lead registrado en estado "NUEVO"
    When el asesor agenda una cita para el "2026-06-01" de "60" minutos
    Then la cita se agrega al lead
    And el estado de la cita es "PENDIENTE"

  Scenario: Fallo al agendar cita en lead cerrado
    Given un lead registrado en estado "PERDIDO"
    When el asesor intenta agendar una cita
    Then el sistema rechaza la operacion indicando que el lead esta cerrado

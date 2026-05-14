Feature: Convertir Lead a Cliente
  Como Asesor Comercial
  Quiero convertir un lead a cliente
  Para iniciar el proceso de cierre y contrato

  Scenario: Convertir lead a cliente exitosamente
    Given un lead activo que no ha sido convertido
    When el asesor lo convierte a cliente
    Then el estado del lead pasa a "CONVERTIDO"

  Scenario: Evitar convertir lead ya convertido
    Given un lead que ya fue convertido a cliente
    When el asesor intenta convertirlo nuevamente a cliente
    Then el sistema debe impedir la operacion

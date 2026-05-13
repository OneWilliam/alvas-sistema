import { describe, expect, test } from "bun:test";
import { EstadoLead } from "./EstadoLead";
import { ErrorDeValidacion } from "../../../shared/domain";

describe("Value Object: EstadoLead", () => {
  test("Debe crear un estado válido de las opciones disponibles", () => {
    // Arrange & Act
    const estado = new EstadoLead("NUEVO");

    // Assert
    expect(estado.valor).toBe("NUEVO");
  });

  test("Debe lanzar ErrorDeValidacion si el estado es inválido", () => {
    // Arrange, Act & Assert
    expect(() => {
      new EstadoLead("INVENTADO");
    }).toThrow(ErrorDeValidacion);
  });

  test("Debe identificar si un estado está cerrado", () => {
    expect(new EstadoLead("CONVERTIDO").estaCerrado()).toBe(true);
    expect(new EstadoLead("PERDIDO").estaCerrado()).toBe(true);
    expect(new EstadoLead("NUEVO").estaCerrado()).toBe(false);
    expect(new EstadoLead("CONTACTO").estaCerrado()).toBe(false);
  });

  test("Debe retornar instancias correctas desde métodos factoría estáticos", () => {
    expect(EstadoLead.nuevo().valor).toBe("NUEVO");
    expect(EstadoLead.convertido().valor).toBe("CONVERTIDO");
  });
});

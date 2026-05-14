import { describe, expect, test } from "bun:test";
import { EstadoLead, ESTADOS_LEAD } from "./EstadoLead";
import { ErrorDeValidacion } from "../../../shared/domain";

describe("Value Object: EstadoLead", () => {
  test("Debe crear estados validos normalizando mayusculas y espacios", () => {
    for (const valor of ESTADOS_LEAD) {
      expect(new EstadoLead(valor.toLowerCase()).valor).toBe(valor);
      expect(new EstadoLead(`  ${valor}  `).valor).toBe(valor);
    }
  });

  test("Debe lanzar ErrorDeValidacion si el estado es invalido", () => {
    expect(() => {
      new EstadoLead("INVENTADO");
    }).toThrow(ErrorDeValidacion);
    expect(() => {
      new EstadoLead(" NUEVO INVENTADO ");
    }).toThrow("Estado de lead inválido:  NUEVO INVENTADO ");
  });

  test("Debe identificar si un estado esta cerrado", () => {
    expect(new EstadoLead("CONVERTIDO").estaCerrado()).toBe(true);
    expect(new EstadoLead("PERDIDO").estaCerrado()).toBe(true);
    expect(new EstadoLead("NUEVO").estaCerrado()).toBe(false);
    expect(new EstadoLead("CONTACTO").estaCerrado()).toBe(false);
    expect(new EstadoLead("AGENDADO").estaCerrado()).toBe(false);
    expect(new EstadoLead("TRABAJANDO").estaCerrado()).toBe(false);
  });

  test("Debe retornar instancias correctas desde metodos factoria estaticos", () => {
    expect(EstadoLead.nuevo().valor).toBe("NUEVO");
    expect(EstadoLead.contacto().valor).toBe("CONTACTO");
    expect(EstadoLead.agendado().valor).toBe("AGENDADO");
    expect(EstadoLead.trabajando().valor).toBe("TRABAJANDO");
    expect(EstadoLead.convertido().valor).toBe("CONVERTIDO");
    expect(EstadoLead.perdido().valor).toBe("PERDIDO");
  });
});

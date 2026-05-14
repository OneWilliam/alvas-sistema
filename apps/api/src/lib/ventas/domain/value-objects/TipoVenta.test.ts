import { describe, expect, test } from "bun:test";
import { TipoVenta } from "./TipoVenta";
import { ErrorDeDominio } from "../../../shared/domain";

describe("Value Object: TipoVenta", () => {
  test("Debe crear un tipo válido (VENTA)", () => {
    const tipo = new TipoVenta("VENTA");
    expect(tipo.valor).toBe("VENTA");
  });

  test("Debe crear un tipo válido (COMPRA) ignorando mayusculas/minusculas y espacios", () => {
    const tipo = new TipoVenta("  compra  ");
    expect(tipo.valor).toBe("COMPRA");
  });

  test("Debe lanzar ErrorDeDominio si el tipo es inválido", () => {
    expect(() => {
      new TipoVenta("PRESTAMO");
    }).toThrow(ErrorDeDominio);
  });
});

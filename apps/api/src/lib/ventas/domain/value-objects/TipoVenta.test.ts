import { describe, expect, test } from "bun:test";
import { TipoVenta, TIPOS_VENTA } from "./TipoVenta";
import { ErrorDeDominio } from "../../../shared/domain";

describe("Value Object: TipoVenta", () => {
  test("Debe crear tipos validos normalizando mayusculas y espacios", () => {
    for (const valor of TIPOS_VENTA) {
      expect(new TipoVenta(valor.toLowerCase()).valor).toBe(valor);
      expect(new TipoVenta(`  ${valor}  `).valor).toBe(valor);
    }
  });

  test("Debe lanzar ErrorDeDominio si el tipo es invalido", () => {
    expect(() => {
      new TipoVenta("PRESTAMO");
    }).toThrow(ErrorDeDominio);
    expect(() => {
      new TipoVenta(" VENTA FUTURA ");
    }).toThrow("Tipo de venta inválido:  VENTA FUTURA ");
  });

  test("Debe identificar compra y venta sin ambiguedad", () => {
    const compra = new TipoVenta("COMPRA");
    const venta = new TipoVenta("VENTA");

    expect(compra.esCompra()).toBe(true);
    expect(compra.esVenta()).toBe(false);
    expect(venta.esCompra()).toBe(false);
    expect(venta.esVenta()).toBe(true);
  });
});

import { describe, expect, test } from "bun:test";

import { PorcentajeConversion } from "../../../src/lib/reportes/domain/value-objects/PorcentajeConversion";

describe("reportes / PorcentajeConversion", () => {
  test("calcula porcentaje derivado y evita divisiones por cero", () => {
    expect(PorcentajeConversion.desdeLeadsYClientes(3, 12).valorNumerico).toBe(25);
    expect(PorcentajeConversion.desdeLeadsYClientes(2, 0).valorNumerico).toBe(200);
  });
});

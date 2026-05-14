import { describe, expect, test } from "bun:test";

import { ErrorDeValidacion } from "../../../src/lib/shared/domain";
import { Contrato } from "../../../src/lib/ventas/domain/entities/Contrato";
import {
  idCliente,
  idContrato,
  idPropiedad,
} from "../../../src/lib/ventas/domain/value-objects/Ids";

describe("ventas / Contrato", () => {
  test("inicia en borrador y solo se firma una vez", () => {
    const contrato = Contrato.crear({
      id: idContrato("contrato-001"),
      idCliente: idCliente("cliente-001"),
      idPropiedad: idPropiedad("propiedad-001"),
      fechaInicio: new Date("2026-06-01T00:00:00.000Z"),
      fechaFin: new Date("2027-06-01T00:00:00.000Z"),
    });

    expect(contrato.estado).toBe("BORRADOR");

    contrato.firmar();

    expect(contrato.estado).toBe("VIGENTE");
    expect(() => contrato.firmar()).toThrow(ErrorDeValidacion);
  });
});

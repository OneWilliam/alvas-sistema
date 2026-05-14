import { describe, expect, test } from "bun:test";

import { Contrato } from "../../../src/lib/ventas/domain/entities/Contrato";
import {
  idCliente,
  idContrato,
  idPropiedad,
} from "../../../src/lib/ventas/domain/value-objects/Ids";

describe("ventas / Contrato", () => {
  const fechaInicio = new Date("2026-06-01T00:00:00.000Z");
  const fechaFin = new Date("2027-06-01T00:00:00.000Z");
  const crearContrato = () =>
    Contrato.crear({
      id: idContrato("contrato-001"),
      idCliente: idCliente("cliente-001"),
      idPropiedad: idPropiedad("propiedad-001"),
      fechaInicio,
      fechaFin,
    });

  test("inicia en borrador y solo se firma una vez", () => {
    const contrato = crearContrato();

    expect(contrato.id).toBe(idContrato("contrato-001"));
    expect(contrato.idCliente).toBe(idCliente("cliente-001"));
    expect(contrato.idPropiedad).toBe(idPropiedad("propiedad-001"));
    expect(contrato.fechaInicio).toEqual(fechaInicio);
    expect(contrato.fechaFin).toEqual(fechaFin);
    expect(contrato.estado).toBe("BORRADOR");
    expect(contrato.creadoEn).toBeInstanceOf(Date);
    expect(contrato.actualizadoEn).toBeInstanceOf(Date);

    contrato.firmar();

    expect(contrato.estado).toBe("VIGENTE");
    expect(() => contrato.firmar()).toThrow(
      "Solo se pueden firmar contratos en estado borrador.",
    );
  });

  test("finaliza contratos y actualiza estado", () => {
    const contrato = crearContrato();

    contrato.finalizar();

    expect(contrato.estado).toBe("FINALIZADO");
    expect(contrato.actualizadoEn).toBeInstanceOf(Date);
  });

  test("reconstituye contratos existentes", () => {
    const creadoEn = new Date("2026-05-01T00:00:00.000Z");
    const actualizadoEn = new Date("2026-05-02T00:00:00.000Z");
    const contrato = Contrato.reconstituir({
      id: idContrato("contrato-002"),
      idCliente: idCliente("cliente-002"),
      idPropiedad: idPropiedad("propiedad-002"),
      fechaInicio,
      fechaFin,
      estado: "VIGENTE",
      creadoEn,
      actualizadoEn,
    });

    expect(contrato.id).toBe(idContrato("contrato-002"));
    expect(contrato.idCliente).toBe(idCliente("cliente-002"));
    expect(contrato.idPropiedad).toBe(idPropiedad("propiedad-002"));
    expect(contrato.estado).toBe("VIGENTE");
    expect(contrato.creadoEn).toEqual(creadoEn);
    expect(contrato.actualizadoEn).toEqual(actualizadoEn);
  });

  test("rechaza contratos con fechas invalidas", () => {
    expect(() =>
      Contrato.crear({
        id: idContrato("contrato-003"),
        idCliente: idCliente("cliente-001"),
        idPropiedad: idPropiedad("propiedad-001"),
        fechaInicio,
        fechaFin: fechaInicio,
      }),
    ).toThrow("La fecha de fin debe ser posterior a la fecha de inicio.");
  });
});

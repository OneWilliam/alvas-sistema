import { describe, expect, test } from "bun:test";

import { ErrorDeValidacion } from "../../../src/lib/shared/domain";
import { Cita } from "../../../src/lib/ventas/domain/entities/Cita";
import { idCita, idLead } from "../../../src/lib/ventas/domain/value-objects/Ids";

describe("ventas / Cita", () => {
  test("protege fechas y cambios invalidos", () => {
    const fechaInicio = new Date("2026-06-01T10:00:00.000Z");
    const cita = Cita.crear({
      id: idCita("cita-001"),
      idLead: idLead("lead-001"),
      fechaInicio,
      fechaFin: new Date("2026-06-01T11:00:00.000Z"),
      estado: "PENDIENTE",
    });

    cita.marcarComoRealizada();

    expect(cita.estado).toBe("REALIZADA");
    expect(() => cita.reprogramar(fechaInicio, 30)).toThrow(ErrorDeValidacion);
    expect(() =>
      Cita.crear({
        id: idCita("cita-002"),
        idLead: idLead("lead-001"),
        fechaInicio,
        fechaFin: fechaInicio,
        estado: "PENDIENTE",
      }),
    ).toThrow(ErrorDeValidacion);
  });
});

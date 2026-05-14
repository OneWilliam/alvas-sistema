import { describe, expect, test } from "bun:test";

import { Cita } from "../../../src/lib/ventas/domain/entities/Cita";
import { idCita, idLead } from "../../../src/lib/ventas/domain/value-objects/Ids";

describe("ventas / Cita", () => {
  const fechaInicio = new Date("2026-06-01T10:00:00.000Z");
  const crearCita = () =>
    Cita.crear({
      id: idCita("cita-001"),
      idLead: idLead("lead-001"),
      idPropiedad: "prop-001",
      fechaInicio,
      fechaFin: new Date("2026-06-01T11:00:00.000Z"),
      estado: "PENDIENTE",
      observacion: "Visita inicial",
    });

  test("expone los datos base de la cita", () => {
    const cita = crearCita();

    expect(cita.id).toBe(idCita("cita-001"));
    expect(cita.idLead).toBe(idLead("lead-001"));
    expect(cita.idPropiedad).toBe("prop-001");
    expect(cita.fechaInicio).toEqual(fechaInicio);
    expect(cita.fechaFin).toEqual(new Date("2026-06-01T11:00:00.000Z"));
    expect(cita.estado).toBe("PENDIENTE");
    expect(cita.observacion).toBe("Visita inicial");
  });

  test("protege fechas y cambios invalidos", () => {
    const cita = crearCita();

    cita.marcarComoRealizada();

    expect(cita.estado).toBe("REALIZADA");
    expect(() => cita.reprogramar(fechaInicio, 30)).toThrow(
      "No se puede reprogramar una cita ya realizada.",
    );
    expect(() =>
      Cita.crear({
        id: idCita("cita-002"),
        idLead: idLead("lead-001"),
        fechaInicio,
        fechaFin: fechaInicio,
        estado: "PENDIENTE",
      }),
    ).toThrow("La fecha de fin debe ser posterior a la fecha de inicio.");
  });

  test("cancela con motivo y evita marcar como realizada una cita cancelada", () => {
    const cita = crearCita();
    const citaSinObservacion = Cita.crear({
      id: idCita("cita-004"),
      idLead: idLead("lead-001"),
      fechaInicio,
      fechaFin: new Date("2026-06-01T11:00:00.000Z"),
      estado: "PENDIENTE",
    });

    cita.cancelar("Cliente no asistio");
    citaSinObservacion.cancelar("Cliente no asistio");

    expect(cita.estado).toBe("CANCELADA");
    expect(cita.observacion).toBe("Visita inicial | Cancelado: Cliente no asistio");
    expect(citaSinObservacion.observacion).toBe("Cancelado: Cliente no asistio");
    expect(() => cita.marcarComoRealizada()).toThrow(
      "No se puede marcar como realizada una cita cancelada.",
    );

    const citaSinMotivo = crearCita();
    citaSinMotivo.cancelar();
    expect(citaSinMotivo.estado).toBe("CANCELADA");
    expect(citaSinMotivo.observacion).toBe("Visita inicial");
  });

  test("reprograma recalculando duracion y normalizando observacion", () => {
    const cita = crearCita();
    const nuevaFecha = new Date("2026-06-02T15:00:00.000Z");

    cita.reprogramar(nuevaFecha, 45, "  Nueva hora confirmada  ");

    expect(cita.estado).toBe("REPROGRAMADA");
    expect(cita.fechaInicio).toEqual(nuevaFecha);
    expect(cita.fechaFin).toEqual(new Date("2026-06-02T15:45:00.000Z"));
    expect(cita.observacion).toBe("Nueva hora confirmada");
    expect(() => cita.reprogramar(nuevaFecha, 0)).toThrow(
      "La duracion de la cita debe ser mayor que cero.",
    );

    const citaSinObservacionNueva = crearCita();
    citaSinObservacionNueva.reprogramar(nuevaFecha, 30);
    expect(citaSinObservacionNueva.observacion).toBe("Visita inicial");
  });

  test("actualiza observacion y propiedad limpiando valores vacios", () => {
    const cita = crearCita();

    cita.actualizarObservacion("  Traer DNI  ");
    cita.actualizarPropiedad("  prop-002  ");
    expect(cita.observacion).toBe("Traer DNI");
    expect(cita.idPropiedad).toBe("prop-002");

    cita.actualizarObservacion("   ");
    cita.actualizarPropiedad("   ");
    expect(cita.observacion).toBeUndefined();
    expect(cita.idPropiedad).toBeUndefined();

    expect(() => cita.actualizarObservacion()).not.toThrow();
    expect(() => cita.actualizarPropiedad()).not.toThrow();
    expect(cita.observacion).toBeUndefined();
    expect(cita.idPropiedad).toBeUndefined();
  });

  test("cambia estado desde texto normalizado", () => {
    const cita = crearCita();

    cita.cambiarEstado(" realizada ", "  Todo conforme  ");
    expect(cita.estado).toBe("REALIZADA");
    expect(cita.observacion).toBe("Todo conforme");

    const cancelada = crearCita();
    cancelada.cambiarEstado(" cancelada ", "No contesta");
    expect(cancelada.estado).toBe("CANCELADA");
    expect(cancelada.observacion).toBe("Visita inicial | Cancelado: No contesta");

    const pendiente = crearCita();
    pendiente.cambiarEstado("reprogramada");
    expect(pendiente.estado).toBe("REPROGRAMADA");
    pendiente.cambiarEstado("pendiente");
    expect(pendiente.estado).toBe("PENDIENTE");
    expect(pendiente.observacion).toBe("Visita inicial");

    expect(() => pendiente.cambiarEstado("aplazada")).toThrow("Estado de cita invalido.");
  });

  test("reconstituye citas existentes", () => {
    const cita = Cita.reconstituir({
      id: idCita("cita-003"),
      idLead: idLead("lead-002"),
      fechaInicio,
      fechaFin: new Date("2026-06-01T10:30:00.000Z"),
      estado: "CANCELADA",
      observacion: "Historica",
    });

    expect(cita.id).toBe(idCita("cita-003"));
    expect(cita.estado).toBe("CANCELADA");
    expect(cita.observacion).toBe("Historica");
  });
});

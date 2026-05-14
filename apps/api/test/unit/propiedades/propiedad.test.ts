import { describe, expect, test } from "bun:test";

import { Propiedad } from "../../../src/lib/propiedades/domain/entities/Propiedad";
import { PropiedadError } from "../../../src/lib/propiedades/domain/errors/PropiedadError";
import {
  idPropiedad,
  idUsuarioRef,
} from "../../../src/lib/propiedades/domain/value-objects";

describe("propiedades / Propiedad", () => {
  test("crea propiedades con datos base y fechas de auditoria", () => {
    const antes = Date.now();
    const propiedad = Propiedad.crear({
      id: "prop-001",
      titulo: "Casa central",
      descripcion: "Casa de dos pisos",
      precio: 250000,
      idAsesor: idUsuarioRef("asesor-001"),
    });
    const despues = Date.now();

    expect(propiedad.id as string).toBe("prop-001");
    expect(propiedad.titulo).toBe("Casa central");
    expect(propiedad.descripcion).toBe("Casa de dos pisos");
    expect(propiedad.precio).toBe(250000);
    expect(propiedad.idAsesor as string).toBe("asesor-001");
    expect(propiedad.creadoEn.getTime()).toBeGreaterThanOrEqual(antes);
    expect(propiedad.creadoEn.getTime()).toBeLessThanOrEqual(despues);
    expect(propiedad.actualizadoEn).toBe(propiedad.creadoEn);
  });

  test("reconstituye propiedades existentes preservando fechas", () => {
    const creadoEn = new Date("2026-01-01T10:00:00.000Z");
    const actualizadoEn = new Date("2026-01-02T10:00:00.000Z");

    const propiedad = Propiedad.reconstituir({
      id: idPropiedad("prop-002"),
      titulo: "Apartamento norte",
      descripcion: "Apartamento con balcon",
      precio: 180000,
      idAsesor: idUsuarioRef("asesor-002"),
      creadoEn,
      actualizadoEn,
    });

    expect(propiedad.id as string).toBe("prop-002");
    expect(propiedad.titulo).toBe("Apartamento norte");
    expect(propiedad.descripcion).toBe("Apartamento con balcon");
    expect(propiedad.precio).toBe(180000);
    expect(propiedad.idAsesor as string).toBe("asesor-002");
    expect(propiedad.creadoEn).toBe(creadoEn);
    expect(propiedad.actualizadoEn).toBe(actualizadoEn);
  });

  test("PropiedadError conserva codigo y contexto del modulo", () => {
    const error = new PropiedadError("No se puede publicar.", "PROPIEDAD_INVALIDA");

    expect(error.name).toBe("ErrorDeDominio");
    expect(error.message).toBe("No se puede publicar.");
    expect(error.codigo).toBe("PROPIEDAD_INVALIDA");
    expect(error.detalle).toEqual({ contexto: "PROPIEDADES" });
  });
});

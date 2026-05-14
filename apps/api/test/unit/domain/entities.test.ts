import { describe, expect, test } from "bun:test";

import { Sesion } from "../../../src/lib/auth/domain";
import { Captacion } from "../../../src/lib/integraciones/domain/entities/Captacion";
import { ErrorDeValidacion } from "../../../src/lib/shared/domain";
import { Usuario } from "../../../src/lib/usuarios/domain/entities";
import { UsuarioYaDeshabilitadoError } from "../../../src/lib/usuarios/domain/errors";
import { Cita } from "../../../src/lib/ventas/domain/entities/Cita";
import { Contrato } from "../../../src/lib/ventas/domain/entities/Contrato";
import {
  idCita,
  idCliente,
  idContrato,
  idLead,
  idPropiedad,
} from "../../../src/lib/ventas/domain/value-objects/Ids";

describe("Entidades y agregados de dominio", () => {
  test("Usuario nace activo y protege deshabilitacion duplicada", () => {
    const usuario = Usuario.crear({
      id: "user-001",
      username: "asesor1",
      nombre: "Asesor Uno",
      hashClave: "hash-seguro-001",
      rol: "ASESOR",
    });

    expect(usuario.estado.valor).toBe("ACTIVO");

    usuario.deshabilitar();

    expect(usuario.estado.valor).toBe("DESHABILITADO");
    expect(() => usuario.deshabilitar()).toThrow(UsuarioYaDeshabilitadoError);
  });

  test("Sesion expone tokens y usuario autenticado", () => {
    const sesion = Sesion.abrir({
      authToken: "auth-token",
      refreshToken: "refresh-token",
      idUsuario: "user-001",
      username: "asesor1",
      rol: "ASESOR",
    });

    expect(sesion.authToken).toBe("auth-token");
    expect(sesion.refreshToken).toBe("refresh-token");
    expect(sesion.rol).toBe("ASESOR");
  });

  test("Cita protege fechas y cambios invalidos", () => {
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

  test("Contrato inicia en borrador y solo se firma una vez", () => {
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

  test("Captacion normaliza entrada y genera email local si falta correo", () => {
    const captacion = Captacion.registrar({
      canal: "whatsapp",
      origen: "campana mayo",
      nombre: "Luis",
      telefono: "999888777",
      tipo: "compra",
      metadata: { campania: "mayo" },
    });

    expect(captacion.canal.valor).toBe("WHATSAPP");
    expect(captacion.tipo).toBe("COMPRA");
    expect(captacion.emailDeContacto).toBe("999888777@contacto.whatsapp.local");
  });
});

import { describe, expect, test } from "bun:test";

import { idUsuarioRef } from "../../../src/lib/shared/domain/value-objects/IdUsuarioRef";
import { Cliente } from "../../../src/lib/ventas/domain/entities/Cliente";
import { idCliente, idLead } from "../../../src/lib/ventas/domain/value-objects/Ids";

describe("ventas / Cliente", () => {
  const idAsesor = idUsuarioRef("asesor-001");

  test("crea clientes con datos de contacto y fechas de auditoria", () => {
    const cliente = Cliente.crear({
      id: "cliente-001",
      nombre: "Maria Perez",
      email: "maria@example.com",
      telefono: "999888777",
      idAsesor,
      idLeadOrigen: idLead("lead-001"),
    });

    expect(cliente.id).toBe(idCliente("cliente-001"));
    expect(cliente.nombre).toBe("Maria Perez");
    expect(cliente.email).toBe("maria@example.com");
    expect(cliente.telefono).toBe("999888777");
    expect(cliente.idAsesor).toBe(idAsesor);
    expect(cliente.idLeadOrigen).toBe(idLead("lead-001"));
    expect(cliente.creadoEn).toBeInstanceOf(Date);
    expect(cliente.actualizadoEn).toBeInstanceOf(Date);
  });

  test("reconstituye clientes existentes", () => {
    const creadoEn = new Date("2026-05-01T00:00:00.000Z");
    const actualizadoEn = new Date("2026-05-02T00:00:00.000Z");
    const cliente = Cliente.reconstituir({
      id: idCliente("cliente-002"),
      nombre: "Luis Gomez",
      email: "luis@example.com",
      telefono: "111222333",
      idAsesor,
      creadoEn,
      actualizadoEn,
    });

    expect(cliente.id).toBe(idCliente("cliente-002"));
    expect(cliente.nombre).toBe("Luis Gomez");
    expect(cliente.email).toBe("luis@example.com");
    expect(cliente.telefono).toBe("111222333");
    expect(cliente.idAsesor).toBe(idAsesor);
    expect(cliente.idLeadOrigen).toBeUndefined();
    expect(cliente.creadoEn).toEqual(creadoEn);
    expect(cliente.actualizadoEn).toEqual(actualizadoEn);
  });

  test("actualiza datos de contacto parcialmente", () => {
    const cliente = Cliente.crear({
      id: "cliente-003",
      nombre: "Nombre original",
      email: "original@example.com",
      telefono: "123456789",
      idAsesor,
    });

    cliente.actualizarDatosContacto({ nombre: "Nombre actualizado" });
    expect(cliente.nombre).toBe("Nombre actualizado");
    expect(cliente.email).toBe("original@example.com");
    expect(cliente.telefono).toBe("123456789");

    cliente.actualizarDatosContacto({
      email: "nuevo@example.com",
      telefono: "987654321",
    });
    expect(cliente.nombre).toBe("Nombre actualizado");
    expect(cliente.email).toBe("nuevo@example.com");
    expect(cliente.telefono).toBe("987654321");
    expect(cliente.actualizadoEn).toBeInstanceOf(Date);
  });

  test("ignora campos de contacto vacios en actualizaciones parciales", () => {
    const cliente = Cliente.crear({
      id: "cliente-004",
      nombre: "Cliente Base",
      email: "base@example.com",
      telefono: "555444333",
      idAsesor,
    });

    cliente.actualizarDatosContacto({ nombre: "", email: "", telefono: "" });

    expect(cliente.nombre).toBe("Cliente Base");
    expect(cliente.email).toBe("base@example.com");
    expect(cliente.telefono).toBe("555444333");
  });
});

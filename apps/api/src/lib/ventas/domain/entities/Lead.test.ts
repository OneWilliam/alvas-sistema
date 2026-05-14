import { describe, expect, test } from "bun:test";
import { Lead } from "./Lead";
import { Cita } from "./Cita";
import { EstadoLead } from "../value-objects/EstadoLead";
import { TipoVenta } from "../value-objects/TipoVenta";
import { ErrorDeValidacion } from "../../../shared/domain";
import { idLead, idCliente, idCita } from "../value-objects/Ids";

describe("Agregado de Dominio: Gestión de Leads", () => {
  test("Debe registrar un nuevo lead con estado inicial NUEVO", () => {
    // Arrange
    const params = {
      id: "lead-123",
      nombre: "Juan Perez",
      email: "juan@example.com",
      telefono: "987654321",
      tipo: "COMPRA",
      idAsesor: "asesor-1",
    };

    // Act
    const lead = Lead.registrar(params);

    // Assert
    expect(lead.id).toBe(idLead("lead-123"));
    expect(lead.estado).toEqual(EstadoLead.nuevo());
    expect(lead.tipo).toEqual(new TipoVenta("COMPRA"));
    expect(lead.citas).toHaveLength(0);
  });

  test("Debe proteger la invariante: No se puede agendar cita en un lead cerrado", () => {
    // Arrange
    const lead = Lead.registrar({
      id: "lead-123",
      nombre: "Juan Perez",
      email: "juan@example.com",
      telefono: "987654321",
      tipo: "COMPRA",
      idAsesor: "asesor-1",
    });
    
    // Cambiamos el estado a CERRADO para la prueba
    lead.cambiarEstado("PERDIDO");

    const citaMock = Cita.reconstituir({
      id: idCita("cita-1"),
      idLead: lead.id,
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 3600000),
      estado: "PENDIENTE",
    });

    // Act & Assert
    expect(() => {
      lead.agendarCita(citaMock);
    }).toThrow(ErrorDeValidacion);
  });

  test("Debe proteger la invariante: No se puede convertir a cliente un lead ya convertido", () => {
    // Arrange
    const lead = Lead.registrar({
      id: "lead-123",
      nombre: "Juan Perez",
      email: "juan@example.com",
      telefono: "987654321",
      tipo: "COMPRA",
      idAsesor: "asesor-1",
    });
    
    // Act
    lead.convertirACliente(idCliente("cli-1"));

    // Assert (La primera vez funciona)
    expect(lead.estado).toEqual(EstadoLead.convertido());
    expect(lead.idCliente).toBe(idCliente("cli-1"));

    // Act & Assert (La segunda vez lanza error)
    expect(() => {
      lead.convertirACliente(idCliente("cli-2"));
    }).toThrow(ErrorDeValidacion);
  });
});

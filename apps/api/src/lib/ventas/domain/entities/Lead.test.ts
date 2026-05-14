import { describe, expect, test } from "bun:test";
import { Lead } from "./Lead";
import { Cita } from "./Cita";
import { EstadoLead } from "../value-objects/EstadoLead";
import { TipoVenta } from "../value-objects/TipoVenta";
import { idLead, idCliente, idCita } from "../value-objects/Ids";
import { idUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { idPropiedad } from "../value-objects/IdPropiedad";

describe("Agregado de Dominio: Gestión de Leads", () => {
  const registrarLead = () =>
    Lead.registrar({
      id: "lead-123",
      nombre: "Juan Perez",
      email: "juan@example.com",
      telefono: "987654321",
      tipo: "COMPRA",
      idAsesor: "asesor-1",
      idPropiedadInteres: "prop-1",
    });

  const crearCita = (params: {
    id: string;
    estado: "PENDIENTE" | "REALIZADA" | "CANCELADA" | "REPROGRAMADA";
    fechaInicio: string;
  }) => {
    const fechaInicio = new Date(params.fechaInicio);

    return Cita.reconstituir({
      id: idCita(params.id),
      idLead: idLead("lead-123"),
      fechaInicio,
      fechaFin: new Date(fechaInicio.getTime() + 60 * 60000),
      estado: params.estado,
    });
  };

  test("Debe registrar un nuevo lead con estado inicial NUEVO", () => {
    // Arrange
    const params = {
      id: "lead-123",
      nombre: "Juan Perez",
      email: "juan@example.com",
      telefono: "987654321",
      tipo: "COMPRA",
      idAsesor: "asesor-1",
      idPropiedadInteres: "prop-1",
    };

    // Act
    const lead = Lead.registrar(params);

    // Assert
    expect(lead.id).toBe(idLead("lead-123"));
    expect(lead.nombre).toBe("Juan Perez");
    expect(lead.email).toBe("juan@example.com");
    expect(lead.telefono).toBe("987654321");
    expect(lead.estado).toEqual(EstadoLead.nuevo());
    expect(lead.tipo).toEqual(new TipoVenta("COMPRA"));
    expect(lead.idAsesor).toBe(idUsuarioRef("asesor-1"));
    expect(lead.idPropiedadInteres).toBe(idPropiedad("prop-1"));
    expect(lead.idCliente).toBeUndefined();
    expect(lead.citas).toHaveLength(0);
    expect(lead.creadoEn).toBeInstanceOf(Date);
    expect(lead.actualizadoEn).toBeInstanceOf(Date);
  });

  test("Debe reconstituir un lead existente", () => {
    const creadoEn = new Date("2026-05-01T00:00:00.000Z");
    const actualizadoEn = new Date("2026-05-02T00:00:00.000Z");
    const cita = crearCita({
      id: "cita-1",
      estado: "PENDIENTE",
      fechaInicio: "2026-06-01T10:00:00.000Z",
    });

    const lead = Lead.reconstituir({
      id: idLead("lead-456"),
      nombre: "Maria",
      email: "maria@example.com",
      telefono: "123456789",
      tipo: new TipoVenta("VENTA"),
      estado: new EstadoLead("CONTACTO"),
      idAsesor: idUsuarioRef("asesor-2"),
      idCliente: idCliente("cliente-1"),
      idPropiedadInteres: idPropiedad("prop-2"),
      citas: [cita],
      creadoEn,
      actualizadoEn,
    });

    expect(lead.id).toBe(idLead("lead-456"));
    expect(lead.nombre).toBe("Maria");
    expect(lead.email).toBe("maria@example.com");
    expect(lead.telefono).toBe("123456789");
    expect(lead.tipo.valor).toBe("VENTA");
    expect(lead.estado.valor).toBe("CONTACTO");
    expect(lead.idAsesor).toBe(idUsuarioRef("asesor-2"));
    expect(lead.idCliente).toBe(idCliente("cliente-1"));
    expect(lead.idPropiedadInteres).toBe(idPropiedad("prop-2"));
    expect(lead.citas).toEqual([cita]);
    expect(lead.creadoEn).toEqual(creadoEn);
    expect(lead.actualizadoEn).toEqual(actualizadoEn);
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
    }).toThrow("No se pueden agendar citas en un lead cerrado.");
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
    }).toThrow("El lead ya ha sido convertido a cliente.");
  });

  test("Debe agendar citas y consultar visitas realizadas ordenadas", () => {
    const lead = registrarLead();
    const primera = crearCita({
      id: "cita-1",
      estado: "REALIZADA",
      fechaInicio: "2026-06-01T10:00:00.000Z",
    });
    const pendiente = crearCita({
      id: "cita-2",
      estado: "PENDIENTE",
      fechaInicio: "2026-06-01T09:00:00.000Z",
    });
    const segunda = crearCita({
      id: "cita-3",
      estado: "REALIZADA",
      fechaInicio: "2026-06-02T10:00:00.000Z",
    });

    lead.agendarCita(segunda);
    lead.agendarCita(pendiente);
    lead.agendarCita(primera);

    expect(lead.citas).toHaveLength(3);
    expect(lead.obtenerCitaPorId(idCita("cita-2"))).toBe(pendiente);
    expect(lead.obtenerCitaPorId(idCita("inexistente"))).toBeUndefined();
    expect(lead.obtenerVisitasRealizadas()).toEqual([primera, segunda]);
    expect(lead.esPrimeraVisita(idCita("cita-1"))).toBe(true);
    expect(lead.esPrimeraVisita(idCita("cita-3"))).toBe(false);
    expect(lead.esSegundaVisita(idCita("cita-3"))).toBe(true);
    expect(lead.esSegundaVisita(idCita("cita-1"))).toBe(false);
    expect(lead.obtenerResumenVisitas()).toEqual({
      tienePrimeraVisita: true,
      tieneSegundaVisita: true,
    });
  });

  test("Debe reportar resumen sin visitas realizadas", () => {
    const lead = registrarLead();

    expect(lead.obtenerVisitasRealizadas()).toEqual([]);
    expect(lead.esPrimeraVisita(idCita("cita-1"))).toBe(false);
    expect(lead.esSegundaVisita(idCita("cita-1"))).toBe(false);
    expect(lead.obtenerResumenVisitas()).toEqual({
      tienePrimeraVisita: false,
      tieneSegundaVisita: false,
    });
  });

  test("Debe reportar resumen con una sola visita realizada", () => {
    const lead = registrarLead();
    const primera = crearCita({
      id: "cita-1",
      estado: "REALIZADA",
      fechaInicio: "2026-06-01T10:00:00.000Z",
    });

    lead.agendarCita(primera);

    expect(lead.obtenerResumenVisitas()).toEqual({
      tienePrimeraVisita: true,
      tieneSegundaVisita: false,
    });
  });

  test("Debe actualizar propiedad, asesor y datos del lead", () => {
    const lead = registrarLead();

    lead.actualizarDatosPropiedad("prop-2");
    lead.cambiarAsesor(idUsuarioRef("asesor-2"));
    lead.actualizarDatos({
      nombre: "  Juan Actualizado  ",
      email: "  JUAN.ACTUALIZADO@EXAMPLE.COM  ",
      telefono: "  111222333  ",
      tipo: "venta",
    });

    expect(lead.idPropiedadInteres).toBe(idPropiedad("prop-2"));
    expect(lead.idAsesor).toBe(idUsuarioRef("asesor-2"));
    expect(lead.nombre).toBe("Juan Actualizado");
    expect(lead.email).toBe("juan.actualizado@example.com");
    expect(lead.telefono).toBe("111222333");
    expect(lead.tipo.valor).toBe("VENTA");
    expect(lead.actualizadoEn).toBeInstanceOf(Date);

    lead.actualizarDatos({ nombre: "Solo Nombre" });
    expect(lead.nombre).toBe("Solo Nombre");
    expect(lead.email).toBe("juan.actualizado@example.com");
    expect(lead.telefono).toBe("111222333");
    expect(lead.tipo.valor).toBe("VENTA");
  });

  test("Debe rechazar actualizaciones invalidas o sobre leads cerrados", () => {
    const lead = registrarLead();

    expect(() => lead.actualizarDatos({ nombre: " " })).toThrow(
      "El nombre del lead es obligatorio.",
    );
    expect(() => lead.actualizarDatos({ email: " " })).toThrow(
      "El email del lead es obligatorio.",
    );
    expect(() => lead.actualizarDatos({ telefono: " " })).toThrow(
      "El telefono del lead es obligatorio.",
    );

    lead.convertirACliente(idCliente("cliente-1"));
    expect(() => lead.actualizarDatos({ nombre: "Otro" })).toThrow(
      "No se puede actualizar un lead cerrado.",
    );
  });

  test("Debe actualizar citas existentes", () => {
    const lead = registrarLead();
    const cita = crearCita({
      id: "cita-1",
      estado: "PENDIENTE",
      fechaInicio: "2026-06-01T10:00:00.000Z",
    });
    lead.agendarCita(cita);

    lead.actualizarCita({
      idCita: idCita("cita-1"),
      observacion: "  Llevar documentos  ",
    });
    expect(cita.observacion).toBe("Llevar documentos");

    lead.actualizarCita({
      idCita: idCita("cita-1"),
      estado: "realizada",
      observacion: "  Visita completada  ",
    });
    expect(cita.estado).toBe("REALIZADA");
    expect(cita.observacion).toBe("Visita completada");

    const citaReprogramable = crearCita({
      id: "cita-2",
      estado: "PENDIENTE",
      fechaInicio: "2026-06-03T10:00:00.000Z",
    });
    lead.agendarCita(citaReprogramable);
    lead.actualizarCita({
      idCita: idCita("cita-2"),
      fechaInicio: new Date("2026-06-04T10:00:00.000Z"),
      duracionMinutos: 30,
      observacion: "  Nueva fecha  ",
    });

    expect(citaReprogramable.estado).toBe("REPROGRAMADA");
    expect(citaReprogramable.fechaFin).toEqual(new Date("2026-06-04T10:30:00.000Z"));
    expect(citaReprogramable.observacion).toBe("Nueva fecha");

    lead.actualizarCita({ idCita: idCita("cita-2") });
    expect(citaReprogramable.observacion).toBe("Nueva fecha");
  });

  test("Debe rechazar actualizaciones de citas inexistentes o incompletas", () => {
    const lead = registrarLead();
    const cita = crearCita({
      id: "cita-1",
      estado: "PENDIENTE",
      fechaInicio: "2026-06-01T10:00:00.000Z",
    });
    lead.agendarCita(cita);

    expect(() => lead.actualizarCita({ idCita: idCita("cita-x"), estado: "REALIZADA" })).toThrow(
      "La cita no existe en este lead.",
    );
    expect(() =>
      lead.actualizarCita({
        idCita: idCita("cita-1"),
        fechaInicio: new Date("2026-06-04T10:00:00.000Z"),
      }),
    ).toThrow("Para reprogramar la cita se requieren fechaInicio y duracionMinutos.");
    expect(() =>
      lead.actualizarCita({
        idCita: idCita("cita-1"),
        duracionMinutos: 45,
      }),
    ).toThrow("Para reprogramar la cita se requieren fechaInicio y duracionMinutos.");
  });
});

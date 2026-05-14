import { describe, expect, mock, test } from "bun:test";

import { type IGeneradorId } from "../../../src/lib/shared/domain/ports/IGeneradorId";
import {
  type IdUsuarioRef,
  idUsuarioRef,
} from "../../../src/lib/shared/domain/value-objects/IdUsuarioRef";
import { AgendarCitaUseCase } from "../../../src/lib/ventas/application/use-cases/AgendarCitaUseCase";
import { ActualizarLeadUseCase } from "../../../src/lib/ventas/application/use-cases/ActualizarLeadUseCase";
import { ConvertirLeadAClienteUseCase } from "../../../src/lib/ventas/application/use-cases/ConvertirLeadAClienteUseCase";
import { RegistrarLeadUseCase } from "../../../src/lib/ventas/application/use-cases/RegistrarLeadUseCase";
import { Cliente } from "../../../src/lib/ventas/domain/entities/Cliente";
import { Lead } from "../../../src/lib/ventas/domain/entities/Lead";
import { type IConsultaPropiedadInteres } from "../../../src/lib/ventas/domain/ports/IConsultaPropiedadInteres";
import { type IVentasRepository } from "../../../src/lib/ventas/domain/ports/IVentasRepository";
import { type IdCliente, type IdLead } from "../../../src/lib/ventas/domain/value-objects/Ids";
import { AutorizadorVentasAdapter } from "../../../src/lib/ventas/infrastructure/security/AutorizadorVentasAdapter";

class SecuenciaGeneradorId implements IGeneradorId {
  private indice = 0;

  constructor(private readonly ids: string[]) {}

  generar(): string {
    return this.ids[this.indice++] ?? `id-${this.indice}`;
  }
}

class FakeVentasRepository implements IVentasRepository {
  readonly leads = new Map<string, Lead>();
  readonly clientes = new Map<string, Cliente>();
  readonly actividades: string[] = [];

  async obtenerLeadPorId(id: IdLead): Promise<Lead | null> {
    return this.leads.get(id) ?? null;
  }

  async guardarLead(lead: Lead): Promise<void> {
    this.leads.set(lead.id, lead);
  }

  async listarLeads(): Promise<Lead[]> {
    return [...this.leads.values()];
  }

  async listarLeadsPorAsesor(idAsesor: IdUsuarioRef): Promise<Lead[]> {
    return [...this.leads.values()].filter((lead) => lead.idAsesor === idAsesor);
  }

  async listarLeadsPorEstado(estado: string): Promise<Lead[]> {
    return [...this.leads.values()].filter((lead) => lead.estado.valor === estado);
  }

  async obtenerClientePorId(id: IdCliente): Promise<Cliente | null> {
    return this.clientes.get(id) ?? null;
  }

  async guardarCliente(cliente: Cliente): Promise<void> {
    this.clientes.set(cliente.id, cliente);
  }

  async listarClientes(): Promise<Cliente[]> {
    return [...this.clientes.values()];
  }

  async listarClientesPorAsesor(idAsesor: IdUsuarioRef): Promise<Cliente[]> {
    return [...this.clientes.values()].filter((cliente) => cliente.idAsesor === idAsesor);
  }

  async registrarActividad(_idLead: IdLead, evento: string): Promise<void> {
    this.actividades.push(evento);
  }

  async obtenerActividadReciente(): Promise<
    { idLead: string; evento: string; descripcion: string; fecha: string }[]
  > {
    return [];
  }

  async listarAsesoresConLeads(): Promise<{ idAsesor: IdUsuarioRef; totalLeads: number }[]> {
    return [{ idAsesor: idUsuarioRef("asesor-1"), totalLeads: this.leads.size }];
  }
}

class FakeEvaluadorAsignacion {
  evaluar() {
    return { esExito: true as const, valor: idUsuarioRef("asesor-1") };
  }
}

class FakeConsultaPropiedadInteres implements IConsultaPropiedadInteres {
  constructor(private readonly propiedadesDisponibles = new Set<string>()) {}

  async propiedadDisponibleParaCompra(idPropiedad: string): Promise<boolean> {
    return this.propiedadesDisponibles.has(idPropiedad);
  }
}

function crearLead(id = "lead-001"): Lead {
  return Lead.registrar({
    id,
    nombre: "Maria",
    email: "maria@example.com",
    telefono: "999888777",
    tipo: "COMPRA",
    idAsesor: "asesor-1",
  });
}

describe("ventas / use cases", () => {
  test("RegistrarLeadUseCase relaciona comprador solo con propiedad disponible", async () => {
    const repo = new FakeVentasRepository();

    const resultado = await new RegistrarLeadUseCase(
      repo,
      new SecuenciaGeneradorId(["lead-001"]),
      new FakeEvaluadorAsignacion(),
      new AutorizadorVentasAdapter(),
      new FakeConsultaPropiedadInteres(new Set(["prop-001"])),
    ).ejecutar({
      nombre: "Comprador",
      email: "comprador@example.com",
      telefono: "300000000",
      tipo: "COMPRA",
      idPropiedadInteres: "prop-001",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(lead?.idPropiedadInteres as string).toBe("prop-001");
  });

  test("RegistrarLeadUseCase rechaza propiedad no disponible o lead vendedor con interes", async () => {
    const repo = new FakeVentasRepository();
    const crearUseCase = () =>
      new RegistrarLeadUseCase(
        repo,
        new SecuenciaGeneradorId(["lead-001"]),
        new FakeEvaluadorAsignacion(),
        new AutorizadorVentasAdapter(),
        new FakeConsultaPropiedadInteres(),
      );

    const propiedadNoDisponible = await crearUseCase().ejecutar({
      nombre: "Comprador",
      email: "comprador@example.com",
      telefono: "300000000",
      tipo: "COMPRA",
      idPropiedadInteres: "prop-preliminar",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const vendedorConInteres = await crearUseCase().ejecutar({
      nombre: "Vendedor",
      email: "vendedor@example.com",
      telefono: "300000001",
      tipo: "VENTA",
      idPropiedadInteres: "prop-001",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    expect(propiedadNoDisponible.esExito).toBe(false);
    expect(propiedadNoDisponible.esExito ? undefined : propiedadNoDisponible.error.codigo).toBe(
      "PROPIEDAD_INTERES_NO_DISPONIBLE",
    );
    expect(vendedorConInteres.esExito).toBe(false);
    expect(vendedorConInteres.esExito ? undefined : vendedorConInteres.error.codigo).toBe(
      "PROPIEDAD_INTERES_NO_APLICA",
    );
    expect(repo.leads.size).toBe(0);
  });

  test("AgendarCitaUseCase agrega cita al lead y registra actividad", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());
    const registrarActividadSpy = mock(repo.registrarActividad.bind(repo));
    repo.registrarActividad = registrarActividadSpy;

    const resultado = await new AgendarCitaUseCase(
      repo,
      new SecuenciaGeneradorId(["cita-001"]),
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      idLead: "lead-001",
      fechaInicio: new Date("2026-06-01T10:00:00.000Z"),
      duracionMinutos: 60,
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(lead?.citas).toHaveLength(1);
    expect(repo.actividades).toContain("CITA_AGENDADA");
    expect(registrarActividadSpy).toHaveBeenCalledTimes(1);
  });

  test("ConvertirLeadAClienteUseCase crea cliente y cierra lead", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new ConvertirLeadAClienteUseCase(
      repo,
      new SecuenciaGeneradorId(["cliente-001"]),
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      idLead: "lead-001",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(repo.clientes.size).toBe(1);
    expect(lead?.estado.valor).toBe("CONVERTIDO");
    expect(repo.actividades).toContain("CONVERTIDO_A_CLIENTE");
  });

  test("rechaza mutaciones de leads ajenos para asesores", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new ActualizarLeadUseCase(
      repo,
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      id: "lead-001",
      nombre: "Otro nombre",
      usuarioAutenticado: { id: "asesor-2", rol: "ASESOR" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.codigo).toBe("SIN_PERMISOS_LEAD");
    expect(lead?.nombre).toBe("Maria");
  });

  test("ActualizarLeadUseCase relaciona comprador con propiedad disponible", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new ActualizarLeadUseCase(
      repo,
      new AutorizadorVentasAdapter(),
      new FakeConsultaPropiedadInteres(new Set(["prop-001"])),
    ).ejecutar({
      id: "lead-001",
      idPropiedadInteres: "prop-001",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(lead?.idPropiedadInteres as string).toBe("prop-001");
  });

  test("ActualizarLeadUseCase rechaza relacionar propiedad no disponible", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new ActualizarLeadUseCase(
      repo,
      new AutorizadorVentasAdapter(),
      new FakeConsultaPropiedadInteres(),
    ).ejecutar({
      id: "lead-001",
      idPropiedadInteres: "prop-preliminar",
      usuarioAutenticado: { id: "asesor-1", rol: "ASESOR" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(false);
    expect(resultado.esExito ? undefined : resultado.error.codigo).toBe(
      "PROPIEDAD_INTERES_NO_DISPONIBLE",
    );
    expect(lead?.idPropiedadInteres).toBeUndefined();
  });

  test("permite a admin mutar leads de cualquier asesor", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());

    const resultado = await new ActualizarLeadUseCase(
      repo,
      new AutorizadorVentasAdapter(),
    ).ejecutar({
      id: "lead-001",
      nombre: "Nombre admin",
      usuarioAutenticado: { id: "admin-1", rol: "ADMIN" },
    });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(lead?.nombre).toBe("Nombre admin");
  });
});

import { describe, expect, mock, test } from "bun:test";

import { type IGeneradorId } from "../../../src/lib/shared/domain/ports/IGeneradorId";
import {
  type IdUsuarioRef,
  idUsuarioRef,
} from "../../../src/lib/shared/domain/value-objects/IdUsuarioRef";
import { AgendarCitaUseCase } from "../../../src/lib/ventas/application/use-cases/AgendarCitaUseCase";
import { ConvertirLeadAClienteUseCase } from "../../../src/lib/ventas/application/use-cases/ConvertirLeadAClienteUseCase";
import { Cliente } from "../../../src/lib/ventas/domain/entities/Cliente";
import { Lead } from "../../../src/lib/ventas/domain/entities/Lead";
import { type IVentasRepository } from "../../../src/lib/ventas/domain/ports/IVentasRepository";
import { type IdCliente, type IdLead } from "../../../src/lib/ventas/domain/value-objects/Ids";

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
  test("AgendarCitaUseCase agrega cita al lead y registra actividad", async () => {
    const repo = new FakeVentasRepository();
    await repo.guardarLead(crearLead());
    const registrarActividadSpy = mock(repo.registrarActividad.bind(repo));
    repo.registrarActividad = registrarActividadSpy;

    const resultado = await new AgendarCitaUseCase(
      repo,
      new SecuenciaGeneradorId(["cita-001"]),
    ).ejecutar({
      idLead: "lead-001",
      fechaInicio: new Date("2026-06-01T10:00:00.000Z"),
      duracionMinutos: 60,
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
    ).ejecutar({ idLead: "lead-001" });

    const lead = await repo.obtenerLeadPorId("lead-001" as IdLead);
    expect(resultado.esExito).toBe(true);
    expect(repo.clientes.size).toBe(1);
    expect(lead?.estado.valor).toBe("CONVERTIDO");
    expect(repo.actividades).toContain("CONVERTIDO_A_CLIENTE");
  });
});

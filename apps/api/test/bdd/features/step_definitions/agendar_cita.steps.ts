import { Given, When, Then } from "@cucumber/cucumber";
import * as assert from "assert";
import { type IGeneradorId } from "../../../../src/lib/shared/domain/ports/IGeneradorId";
import { AgendarCitaUseCase } from "../../../../src/lib/ventas/application/use-cases/AgendarCitaUseCase";
import { Lead } from "../../../../src/lib/ventas/domain/entities/Lead";
import { type Cita } from "../../../../src/lib/ventas/domain/entities/Cita";
import { type Cliente } from "../../../../src/lib/ventas/domain/entities/Cliente";
import { type Contrato } from "../../../../src/lib/ventas/domain/entities/Contrato";
import { type IVentasRepository } from "../../../../src/lib/ventas/domain/ports/IVentasRepository";
import { type IdUsuarioRef } from "../../../../src/lib/shared/domain/value-objects/IdUsuarioRef";
import { type IdLead } from "../../../../src/lib/ventas/domain/value-objects/Ids";

let lead: Lead;
let repository: FakeVentasRepository;
let resultadoAgenda: Awaited<ReturnType<AgendarCitaUseCase["ejecutar"]>>;

class GeneradorIdFijo implements IGeneradorId {
  generar(): string {
    return "cita-1";
  }
}

class FakeVentasRepository implements IVentasRepository {
  readonly leads = new Map<string, Lead>();
  readonly actividades: string[] = [];

  async obtenerLeadPorId(id: IdLead): Promise<Lead | null> {
    return this.leads.get(id) ?? null;
  }

  async guardarLead(leadGuardado: Lead): Promise<void> {
    this.leads.set(leadGuardado.id, leadGuardado);
  }

  async listarLeads(): Promise<Lead[]> {
    return [...this.leads.values()];
  }

  async listarLeadsPorAsesor(idAsesor: IdUsuarioRef): Promise<Lead[]> {
    return [...this.leads.values()].filter((leadActual) => leadActual.idAsesor === idAsesor);
  }

  async listarLeadsPorEstado(estado: string): Promise<Lead[]> {
    return [...this.leads.values()].filter((leadActual) => leadActual.estado.valor === estado);
  }

  async listarAsesoresConLeads(): Promise<{ idAsesor: IdUsuarioRef; totalLeads: number }[]> {
    return [];
  }

  async obtenerClientePorId(): Promise<Cliente | null> {
    return null;
  }

  async guardarCliente(): Promise<void> {}

  async listarClientes(): Promise<Cliente[]> {
    return [];
  }

  async listarClientesPorAsesor(): Promise<Cliente[]> {
    return [];
  }

  async obtenerCitaPorId(): Promise<Cita | undefined> {
    return undefined;
  }

  async guardarCita(): Promise<void> {}

  async listarCitas(): Promise<Cita[]> {
    return [];
  }

  async obtenerContratoPorId(): Promise<Contrato | undefined> {
    return undefined;
  }

  async guardarContrato(): Promise<void> {}

  async listarContratos(): Promise<Contrato[]> {
    return [];
  }

  async listarPropiedadesPorCliente(): Promise<{ idPropiedad: string }[]> {
    return [];
  }

  async buscarAsesorConMenosLeads(): Promise<string | undefined> {
    return undefined;
  }

  async registrarActividad(_idLead: IdLead, evento: string): Promise<void> {
    this.actividades.push(evento);
  }

  async obtenerActividadReciente(): Promise<
    { idLead: string; evento: string; descripcion: string; fecha: string }[]
  > {
    return [];
  }
}

Given("un lead registrado en estado {string}", function (estadoStr: string) {
  lead = Lead.registrar({
    id: "lead-123",
    nombre: "Pedro",
    email: "pedro@example.com",
    telefono: "123",
    tipo: "COMPRA",
    idAsesor: "asesor-1",
  });
  if (estadoStr !== "NUEVO") {
    lead.cambiarEstado(estadoStr);
  }
  repository = new FakeVentasRepository();
  repository.leads.set(lead.id, lead);
  resultadoAgenda = undefined as unknown as Awaited<ReturnType<AgendarCitaUseCase["ejecutar"]>>;
});

When(
  "el asesor agenda una cita para el {string} de {string} minutos",
  async function (fechaStr: string, duracion: string) {
    resultadoAgenda = await new AgendarCitaUseCase(repository, new GeneradorIdFijo()).ejecutar({
      idLead: lead.id,
      fechaInicio: new Date(fechaStr),
      duracionMinutos: parseInt(duracion),
    });
    lead = (await repository.obtenerLeadPorId(lead.id as IdLead)) ?? lead;
  },
);

Then("la cita queda agregada al lead con estado {string}", function (estadoEsperado: string) {
  assert.strictEqual(resultadoAgenda.esExito, true);
  assert.strictEqual(lead.citas.length, 1);
  assert.strictEqual(lead.citas[0]?.estado, estadoEsperado);
});

When("el asesor intenta agendar una cita", async function () {
  resultadoAgenda = await new AgendarCitaUseCase(repository, new GeneradorIdFijo()).ejecutar({
    idLead: lead.id,
    fechaInicio: new Date("2026-06-01T10:00:00.000Z"),
    duracionMinutos: 60,
  });
});

Then("el sistema rechaza la operacion indicando que el lead esta cerrado", function () {
  assert.strictEqual(resultadoAgenda.esExito, false);
});

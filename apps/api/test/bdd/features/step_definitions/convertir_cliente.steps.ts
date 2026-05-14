import { Given, When, Then } from "@cucumber/cucumber";
import * as assert from "assert";
import { type IGeneradorId } from "../../../../src/lib/shared/domain/ports/IGeneradorId";
import { ConvertirLeadAClienteUseCase } from "../../../../src/lib/ventas/application/use-cases/ConvertirLeadAClienteUseCase";
import { Cliente } from "../../../../src/lib/ventas/domain/entities/Cliente";
import { Lead } from "../../../../src/lib/ventas/domain/entities/Lead";
import { type Cita } from "../../../../src/lib/ventas/domain/entities/Cita";
import { type Contrato } from "../../../../src/lib/ventas/domain/entities/Contrato";
import { type IVentasRepository } from "../../../../src/lib/ventas/domain/ports/IVentasRepository";
import { type IdUsuarioRef } from "../../../../src/lib/shared/domain/value-objects/IdUsuarioRef";
import { idCliente, type IdCliente, type IdLead } from "../../../../src/lib/ventas/domain/value-objects/Ids";

let leadConv: Lead;
let repository: FakeVentasRepository;
let resultadoConversion: Awaited<ReturnType<ConvertirLeadAClienteUseCase["ejecutar"]>>;

class GeneradorIdCliente implements IGeneradorId {
  generar(): string {
    return "cliente-002";
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
    return [...this.leads.values()].filter((leadActual) => leadActual.idAsesor === idAsesor);
  }

  async listarLeadsPorEstado(estado: string): Promise<Lead[]> {
    return [...this.leads.values()].filter((leadActual) => leadActual.estado.valor === estado);
  }

  async listarAsesoresConLeads(): Promise<{ idAsesor: IdUsuarioRef; totalLeads: number }[]> {
    return [];
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

Given("un lead activo que no ha sido convertido", function () {
  leadConv = Lead.registrar({
    id: "lead-456",
    nombre: "Ana",
    email: "ana@example.com",
    telefono: "123",
    tipo: "COMPRA",
    idAsesor: "asesor-1",
  });
  repository = new FakeVentasRepository();
  repository.leads.set(leadConv.id, leadConv);
  resultadoConversion = undefined as unknown as Awaited<
    ReturnType<ConvertirLeadAClienteUseCase["ejecutar"]>
  >;
});

Given("un lead que ya fue convertido a cliente", function () {
  leadConv = Lead.registrar({
    id: "lead-456",
    nombre: "Ana",
    email: "ana@example.com",
    telefono: "123",
    tipo: "COMPRA",
    idAsesor: "asesor-1",
  });
  leadConv.convertirACliente(idCliente("cliente-001"));
  repository = new FakeVentasRepository();
  repository.leads.set(leadConv.id, leadConv);
  resultadoConversion = undefined as unknown as Awaited<
    ReturnType<ConvertirLeadAClienteUseCase["ejecutar"]>
  >;
});

When("el asesor lo convierte a cliente", async function () {
  resultadoConversion = await new ConvertirLeadAClienteUseCase(
    repository,
    new GeneradorIdCliente(),
  ).ejecutar({ idLead: leadConv.id });
  leadConv = (await repository.obtenerLeadPorId(leadConv.id as IdLead)) ?? leadConv;
});

When("el asesor intenta convertirlo nuevamente a cliente", async function () {
  resultadoConversion = await new ConvertirLeadAClienteUseCase(
    repository,
    new GeneradorIdCliente(),
  ).ejecutar({ idLead: leadConv.id });
});

Then("el estado del lead pasa a {string}", function (estadoStr: string) {
  assert.strictEqual(resultadoConversion.esExito, true);
  assert.strictEqual(leadConv.estado.valor, estadoStr);
});

Then("el sistema debe impedir la operacion", function () {
  assert.strictEqual(resultadoConversion.esExito, false);
});

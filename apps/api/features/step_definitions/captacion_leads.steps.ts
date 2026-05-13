import { Given, When, Then } from "@cucumber/cucumber";
import * as assert from "assert";

import { RegistrarLeadUseCase } from "../../src/lib/ventas/application/use-cases/RegistrarLeadUseCase";
import { type IVentasRepository } from "../../src/lib/ventas/domain/ports/IVentasRepository";
import { type Lead } from "../../src/lib/ventas/domain/entities/Lead";
import { type Cita } from "../../src/lib/ventas/domain/entities/Cita";
import { type Cliente } from "../../src/lib/ventas/domain/entities/Cliente";
import { type Contrato } from "../../src/lib/ventas/domain/entities/Contrato";
import { type IdLead, type IdCliente } from "../../src/lib/ventas/domain/value-objects/Ids";
import { type IEvaluadorAsignacion, type AsesorStat } from "../../src/lib/ventas/domain/services/EvaluadorAsignacion";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../src/lib/shared";
import { ErrorDeDominio } from "../../src/lib/shared/domain";
import { idUsuarioRef, type IdUsuarioRef } from "../../src/lib/shared/domain/value-objects/IdUsuarioRef";

class MockVentasRepository implements IVentasRepository {
  async obtenerCitaPorId(): Promise<Cita | undefined> { return undefined; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async obtenerClientePorId(_id: IdCliente): Promise<Cliente | null> { return null; }
  async obtenerContratoPorId(): Promise<Contrato | undefined> { return undefined; }
  async guardarCita(): Promise<void> {}
  async guardarCliente(): Promise<void> {}
  async guardarContrato(): Promise<void> {}
  async listarLeads(): Promise<Lead[]> { return []; }
  async listarLeadsPorAsesor(): Promise<Lead[]> { return []; }
  async listarCitas(): Promise<Cita[]> { return []; }
  async listarClientes(): Promise<Cliente[]> { return []; }
  async listarContratos(): Promise<Contrato[]> { return []; }
  async listarPropiedadesPorCliente(): Promise<{ idPropiedad: string }[]> { return []; }
  async buscarAsesorConMenosLeads(): Promise<string | undefined> { return undefined; }
  async listarLeadsPorEstado(): Promise<Lead[]> { return []; }
  async listarClientesPorAsesor(): Promise<Cliente[]> { return []; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async obtenerActividadReciente(_limite: number): Promise<{ idLead: string; evento: string; descripcion: string; fecha: string; }[]> { return []; }
  
  public leads: Lead[] = [];
  async guardarLead(lead: Lead): Promise<void> {
    this.leads.push(lead);
  }
  async obtenerLeadPorId(id: IdLead): Promise<Lead | null> {
    return this.leads.find(l => l.id === id) || null;
  }
  async registrarActividad(): Promise<void> {}
  async listarAsesoresConLeads(): Promise<{ idAsesor: IdUsuarioRef; totalLeads: number }[]> {
    return []; // Para simular que no hay asesores
  }
}

class MockGeneradorId {
  generar(): string {
    return "id-12345";
  }
}

class MockEvaluadorAsignacion implements IEvaluadorAsignacion {
  debeFallar: boolean;
  constructor(debeFallar: boolean = false) {
    this.debeFallar = debeFallar;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evaluar(_stats: AsesorStat[]): Resultado<IdUsuarioRef, ErrorDeDominio> {
    if (this.debeFallar) {
      return resultadoFallido(new ErrorDeDominio("No hay asesores disponibles"));
    }
    return resultadoExitoso(idUsuarioRef("asesor-mock-1"));
  }
}

let repository: MockVentasRepository;
let casoDeUso: RegistrarLeadUseCase;
let resultado: Resultado<Lead, ErrorDeDominio>;

Given('que el negocio no tiene asesores disponibles', function () {
  repository = new MockVentasRepository();
  const evaluador = new MockEvaluadorAsignacion(true); // Falla porque no hay asesores
  casoDeUso = new RegistrarLeadUseCase(repository, new MockGeneradorId(), evaluador);
});

Given('que el negocio tiene asesores disponibles', function () {
  repository = new MockVentasRepository();
  const evaluador = new MockEvaluadorAsignacion(false); // Hay asesores
  casoDeUso = new RegistrarLeadUseCase(repository, new MockGeneradorId(), evaluador);
});

When('un nuevo prospecto {string} con correo {string} solicita informacion sobre ventas', async function (nombre: string, email: string) {
  resultado = await casoDeUso.ejecutar({
    nombre,
    email,
    telefono: "123456789",
    tipo: "VENTA"
  });
});

Then('el sistema no lo registra y falla por falta de asesores', function () {
  assert.strictEqual(resultado.esExito, false);
});

Then('el sistema lo registra como un nuevo lead', function () {
  assert.strictEqual(resultado.esExito, true);
  assert.strictEqual(repository.leads.length, 1);
});

Then('el estado inicial del lead es {string}', function (estadoEsperado: string) {
  if (resultado.esExito) {
    assert.strictEqual(resultado.valor.estado.valor, estadoEsperado);
  } else {
    assert.fail("El resultado debió ser exitoso");
  }
});

import { Given, When, Then } from "@cucumber/cucumber";
import * as assert from "assert";
import { Lead } from "../../../../src/lib/ventas/domain/entities/Lead";
import { Cita } from "../../../../src/lib/ventas/domain/entities/Cita";
import { ErrorDeValidacion } from "../../../../src/lib/shared/domain";
import { idCita } from "../../../../src/lib/ventas/domain/value-objects/Ids";

let lead: Lead;
let errorLanzado: unknown;

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
  errorLanzado = undefined;
});

When(
  "el asesor agenda una cita para el {string} de {string} minutos",
  function (fechaStr: string, duracion: string) {
    const cita = Cita.reconstituir({
      id: idCita("cita-1"),
      idLead: lead.id,
      fechaInicio: new Date(fechaStr),
      fechaFin: new Date(new Date(fechaStr).getTime() + parseInt(duracion) * 60000),
      estado: "PENDIENTE",
    });
    lead.agendarCita(cita);
  },
);

Then("la cita se agrega al lead", function () {
  assert.strictEqual(lead.citas.length, 1);
});

Then("el estado de la cita es {string}", function (estadoEsperado: string) {
  assert.strictEqual(lead.citas[0]?.estado, estadoEsperado);
});

When("el asesor intenta agendar una cita", function () {
  const cita = Cita.reconstituir({
    id: idCita("cita-2"),
    idLead: lead.id,
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 3600000), // +1 hora
    estado: "PENDIENTE",
  });
  try {
    lead.agendarCita(cita);
  } catch (err) {
    errorLanzado = err;
  }
});

Then("el sistema rechaza la operacion indicando que el lead esta cerrado", function () {
  assert.ok(errorLanzado instanceof ErrorDeValidacion);
});

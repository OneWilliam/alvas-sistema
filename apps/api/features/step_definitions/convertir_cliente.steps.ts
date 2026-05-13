import { Given, When, Then } from "@cucumber/cucumber";
import * as assert from "assert";
import { Lead } from "../../src/lib/ventas/domain/entities/Lead";
import { idCliente } from "../../src/lib/ventas/domain/value-objects/Ids";
import { ErrorDeValidacion } from "../../src/lib/shared/domain";

let leadConv: Lead;
let errorConversion: unknown;

Given('un lead activo que no ha sido convertido', function () {
  leadConv = Lead.registrar({
    id: "lead-456",
    nombre: "Ana",
    email: "ana@example.com",
    telefono: "123",
    tipo: "COMPRA",
    idAsesor: "asesor-1"
  });
  errorConversion = undefined;
});

Given('un lead que ya fue convertido a cliente', function () {
  leadConv = Lead.registrar({
    id: "lead-456",
    nombre: "Ana",
    email: "ana@example.com",
    telefono: "123",
    tipo: "COMPRA",
    idAsesor: "asesor-1"
  });
  leadConv.convertirACliente(idCliente("cliente-001"));
  errorConversion = undefined;
});

When('el asesor lo convierte a cliente', function () {
  try {
    leadConv.convertirACliente(idCliente("cliente-002"));
  } catch (err) {
    errorConversion = err;
  }
});

When('el asesor intenta convertirlo nuevamente a cliente', function () {
  try {
    leadConv.convertirACliente(idCliente("cliente-003"));
  } catch (err) {
    errorConversion = err;
  }
});

Then('el estado del lead pasa a {string}', function (estadoStr: string) {
  assert.strictEqual(leadConv.estado.valor, estadoStr);
});

Then('el sistema debe impedir la operacion', function () {
  assert.ok(errorConversion instanceof ErrorDeValidacion);
});

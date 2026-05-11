import {
  ProcesarCaptacionEntranteUseCase,
  ProcesarWhatsAppWebhookUseCase,
} from "../lib/integraciones/application";
import { type IntegracionesRouterDeps } from "../lib/integraciones/infrastructure";
import { RegistroLeadCaptacionVentasAdapter } from "../lib/ventas/infrastructure/adapters/RegistroLeadCaptacionVentasAdapter";
import { crearRegistrarLeadUseCase } from "./ventas";

export function crearIntegracionesRouterDeps(): IntegracionesRouterDeps {
  return {
    crearProcesarWhatsAppWebhook: (c) =>
      new ProcesarWhatsAppWebhookUseCase(
        new RegistroLeadCaptacionVentasAdapter(crearRegistrarLeadUseCase(c.env.DB)),
      ),
    crearProcesarCaptacionEntrante: (c) =>
      new ProcesarCaptacionEntranteUseCase(
        new RegistroLeadCaptacionVentasAdapter(crearRegistrarLeadUseCase(c.env.DB)),
      ),
  };
}

import { type Context } from "hono";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import {
  ProcesarWhatsAppWebhookUseCase,
  type EntradaWhatsAppWebhook,
} from "../../application/use-cases/ProcesarWhatsAppWebhookUseCase";
import { type IRegistroLeadCaptacion } from "../../domain/ports/IRegistroLeadCaptacion";

function comparacionSeguraConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let acum = 0;
  for (let i = 0; i < a.length; i++) {
    acum |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return acum === 0;
}

export type BindingsIntegraciones = {
  DB: D1DatabaseLike;
  INTEGRACION_WHATSAPP_SECRETO?: string;
};

export type IntegracionesRouterDeps = {
  crearRegistroLeadCaptacion: (db: D1DatabaseLike) => IRegistroLeadCaptacion;
};

type ContextoIntegraciones = Context<{ Bindings: BindingsIntegraciones }>;

export class IntegracionesController {
  constructor(private readonly deps: IntegracionesRouterDeps) {}

  async recibirWhatsAppLead(c: ContextoIntegraciones): Promise<Response> {
    const secretoEsperado = c.env.INTEGRACION_WHATSAPP_SECRETO;
    if (secretoEsperado) {
      const secretoRecibido = c.req.header("x-integracion-secreto") ?? "";
      if (!comparacionSeguraConstante(secretoRecibido, secretoEsperado)) {
        return c.json(
          { success: false, message: "No autorizado", code: "WEBHOOK_SECRETO_INVALIDO" },
          401,
        );
      }
    }

    try {
      const body = await c.req.json<EntradaWhatsAppWebhook>();
      const registro = this.deps.crearRegistroLeadCaptacion(c.env.DB);
      const useCase = new ProcesarWhatsAppWebhookUseCase(registro);
      const resultado = await useCase.ejecutar(body);

      if (!resultado.esExito) {
        return c.json(
          { success: false, message: resultado.error.message, code: resultado.error.codigo },
          400,
        );
      }

      return c.json(
        { success: true, message: "Lead recibido y asignado", data: resultado.valor },
        201,
      );
    } catch (error) {
      console.error("IntegracionesController.recibirWhatsAppLead:", error);
      return c.json(
        { success: false, message: "Error procesando webhook", code: "WEBHOOK_ERROR_INTERNO" },
        500,
      );
    }
  }
}

import { type Context } from "hono";
import {
  type CaptacionEntranteDTO,
  type EntradaWhatsAppWebhookDTO,
  type IProcesarCaptacionEntrante,
  type IProcesarWhatsAppWebhook,
} from "../../application";
import { type D1DatabaseLike } from "../../../shared/infrastructure";

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
  crearProcesarWhatsAppWebhook: (c: ContextoIntegraciones) => IProcesarWhatsAppWebhook;
  crearProcesarCaptacionEntrante: (c: ContextoIntegraciones) => IProcesarCaptacionEntrante;
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
      const body = await c.req.json<EntradaWhatsAppWebhookDTO>();
      const useCase = this.deps.crearProcesarWhatsAppWebhook(c);
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

  async recibirCaptacion(c: ContextoIntegraciones): Promise<Response> {
    try {
      const body = await c.req.json<CaptacionEntranteDTO>();
      const useCase = this.deps.crearProcesarCaptacionEntrante(c);
      const resultado = await useCase.ejecutar(body);

      if (!resultado.esExito) {
        return c.json(
          { success: false, message: resultado.error.message, code: resultado.error.codigo },
          400,
        );
      }

      return c.json(
        { success: true, message: "Captacion recibida y registrada", data: resultado.valor },
        201,
      );
    } catch (error) {
      console.error("IntegracionesController.recibirCaptacion:", error);
      return c.json(
        { success: false, message: "Error procesando captacion", code: "CAPTACION_ERROR_INTERNO" },
        500,
      );
    }
  }
}

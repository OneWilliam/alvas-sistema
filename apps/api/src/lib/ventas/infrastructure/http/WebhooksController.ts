import { type Context } from "hono";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { RegistrarLeadUseCase, EvaluarLeadParaAsignarUseCase } from "../../application";
import { D1VentasRepository } from "../persistence/D1VentasRepository";
import { UuidGeneradorId } from "../../../shared/infrastructure/security/UuidGeneradorId";

export type BindingsWebhooks = {
  DB: D1DatabaseLike;
};

export class WebhooksController {
  async recibirLeadDeWhatsApp(c: Context): Promise<Response> {
    try {
      // Formato esperado de la integración de WhatsApp (ej. de una herramienta como ManyChat o similar)
      const body = await c.req.json<{ 
        wa_id: string; 
        wa_name: string; 
        pregunta_tipo?: string; 
        propiedad_id?: string 
      }>();

      const repo = new D1VentasRepository(c.env.DB);
      const generadorId = new UuidGeneradorId();
      const evaluador = new EvaluarLeadParaAsignarUseCase(repo);
      const useCase = new RegistrarLeadUseCase(repo, generadorId, evaluador);

      const resultado = await useCase.ejecutar({
        nombre: body.wa_name,
        email: `${body.wa_id}@whatsapp.com`, // Email placeholder
        telefono: body.wa_id,
        tipo: body.pregunta_tipo || "CAPTACION",
        idPropiedadInteres: body.propiedad_id,
        // idAsesor no se envía, para que use la asignación automática
      });

      if (!resultado.esExito) {
        return c.json({ success: false, message: resultado.error.message }, 400);
      }

      return c.json({ success: true, message: "Lead recibido y asignado" }, 201);
    } catch {
      return c.json({ success: false, message: "Error procesando webhook" }, 500);
    }
  }
}

import { Hono } from "hono";
import {
  IntegracionesController,
  type BindingsIntegraciones,
  type IntegracionesRouterDeps,
} from "./IntegracionesController";

export function crearIntegracionesRouter(deps: IntegracionesRouterDeps) {
  const router = new Hono<{ Bindings: BindingsIntegraciones }>();
  const controller = new IntegracionesController(deps);

  router.post("/webhooks/whatsapp", (c) => controller.recibirWhatsAppLead(c));

  return router;
}

import { Hono } from "hono";
import { VentasController, type BindingsVentas } from "./VentasController";
import { WebhooksController } from "./WebhooksController";
import { verifyTokenMiddleware } from "../../../auth/infrastructure/http/middlewares/VerifyTokenMiddleware";

const ventasRouter = new Hono<{ Bindings: BindingsVentas; Variables: { authPayload: { idUsuario: string; rol: string } } }>();
const controller = new VentasController();
const webhooks = new WebhooksController();

// Webhooks (sin auth global por ahora, o con su propia validación)
ventasRouter.post("/webhooks/whatsapp", (c) => webhooks.recibirLeadDeWhatsApp(c));

// Rutas protegidas
ventasRouter.use("*", verifyTokenMiddleware());

ventasRouter.get("/stats", (c) => controller.obtenerStats(c));
ventasRouter.get("/reporte", (c) => controller.obtenerReporte(c));
ventasRouter.get("/pipeline", (c) => controller.listarPipeline(c));
ventasRouter.post("/lead", (c) => controller.registrarLead(c));
ventasRouter.put("/lead/:id", (c) => controller.editarLead(c));
ventasRouter.post("/cliente", (c) => controller.registrarClienteDirecto(c));
ventasRouter.post("/cita", (c) => controller.agendarCita(c));
ventasRouter.put("/lead/:idLead/cita/:idCita", (c) => controller.editarCita(c));
ventasRouter.post("/convertir", (c) => controller.convertirACliente(c));

export { ventasRouter };

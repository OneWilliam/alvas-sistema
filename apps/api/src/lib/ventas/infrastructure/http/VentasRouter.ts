import { Hono } from "hono";
import { VentasController, type BindingsVentas } from "./VentasController";
import { verifyTokenMiddleware } from "../../../auth/infrastructure/http/middlewares/VerifyTokenMiddleware";

const ventasRouter = new Hono<{ Bindings: BindingsVentas; Variables: { authPayload: { idUsuario: string; rol: string } } }>();
const controller = new VentasController();

ventasRouter.use("*", verifyTokenMiddleware());

ventasRouter.get("/pipeline", (c) => controller.listarPipeline(c));
ventasRouter.post("/lead", (c) => controller.registrarLead(c));
ventasRouter.post("/cliente", (c) => controller.registrarClienteDirecto(c));
ventasRouter.post("/cita", (c) => controller.agendarCita(c));
ventasRouter.post("/convertir", (c) => controller.convertirACliente(c));

export { ventasRouter };

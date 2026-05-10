import { Hono } from "hono";
import { VentasController, type BindingsVentas } from "./VentasController";
import { verifyTokenMiddleware } from "../../../auth/infrastructure/http/middlewares/VerifyTokenMiddleware";

const ventasRouter = new Hono<{ Bindings: BindingsVentas; Variables: { authPayload: { idUsuario: string; rol: string } } }>();
const controller = new VentasController();

ventasRouter.use("*", verifyTokenMiddleware());

ventasRouter.get("/pipeline", (c) => controller.listarPipeline(c));
ventasRouter.post("/lead", (c) => controller.registrarLead(c));
ventasRouter.put("/lead/:id", (c) => controller.editarLead(c));
ventasRouter.post("/cliente", (c) => controller.registrarClienteDirecto(c));
ventasRouter.post("/cita", (c) => controller.agendarCita(c));
ventasRouter.put("/lead/:idLead/cita/:idCita", (c) => controller.editarCita(c));
ventasRouter.post("/convertir", (c) => controller.convertirACliente(c));

export { ventasRouter };

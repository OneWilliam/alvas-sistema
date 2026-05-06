import { Hono } from "hono";
import { LeadController, type BindingsLeads } from "./LeadController";
import { verifyTokenMiddleware } from "../../../auth/infrastructure/http/middlewares/VerifyTokenMiddleware";

type SesionActiva = { idUsuario: string; rol: string };

const leadRouter = new Hono<{ Bindings: BindingsLeads; Variables: { authPayload: SesionActiva } }>();
const controller = new LeadController();

leadRouter.use("*", verifyTokenMiddleware());
leadRouter.get("/", (c) => controller.listar(c));
leadRouter.post("/", (c) => controller.crear(c));

export { leadRouter };

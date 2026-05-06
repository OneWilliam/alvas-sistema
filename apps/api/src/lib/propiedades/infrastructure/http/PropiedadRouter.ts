import { Hono } from "hono";
import { PropiedadController, type BindingsPropiedades } from "./PropiedadController";
import { verifyTokenMiddleware } from "../../../auth/infrastructure/http/middlewares/VerifyTokenMiddleware";

type SesionActiva = { idUsuario: string; rol: string };

const propiedadRouter = new Hono<{ Bindings: BindingsPropiedades; Variables: { authPayload: SesionActiva } }>();
const controller = new PropiedadController();

propiedadRouter.use("*", verifyTokenMiddleware());
propiedadRouter.get("/", (c) => controller.listar(c));
propiedadRouter.post("/", (c) => controller.crear(c));

export { propiedadRouter };

import { Hono } from "hono";
import { CitaController, type BindingsCitas } from "./CitaController";
import { verifyTokenMiddleware } from "../../../auth/infrastructure/http/middlewares/VerifyTokenMiddleware";

type SesionActiva = {
  idUsuario: string;
  rol: string;
};

const citaRouter = new Hono<{ 
  Bindings: BindingsCitas;
  Variables: { authPayload: SesionActiva };
}>();
const controller = new CitaController();

// Todas las rutas de citas requieren autenticación
citaRouter.use("*", verifyTokenMiddleware());

citaRouter.get("/", (c) => controller.listar(c));
citaRouter.post("/", (c) => controller.crear(c));

export { citaRouter };

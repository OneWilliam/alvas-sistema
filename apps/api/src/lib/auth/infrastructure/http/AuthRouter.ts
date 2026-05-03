import { Hono } from "hono";
import { AuthController, type AuthBindings, type AuthVariables } from "./AuthController";
import { verifyTokenMiddleware } from "./middlewares/VerifyTokenMiddleware";

export const crearAuthRouter = () => {
  const router = new Hono<{ Bindings: AuthBindings; Variables: AuthVariables }>();
  const controller = new AuthController();

  router.post("/login", (c) => controller.login(c));
  router.post("/refresh", (c) => controller.refresh(c));
  router.get("/me", verifyTokenMiddleware(), (c) => controller.me(c));

  return router;
};

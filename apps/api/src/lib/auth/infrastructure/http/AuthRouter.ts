import { Hono } from "hono";
import { AuthController, type AuthControllerDeps, type BindingsAuth } from "./AuthController";

export function crearAuthRouter(deps: AuthControllerDeps) {
  const router = new Hono<{ Bindings: BindingsAuth }>();
  const controller = new AuthController(deps);

  router.post("/login", (c) => controller.iniciarSesion(c));
  router.post("/refresh", (c) => controller.renovarSesion(c));

  return router;
}

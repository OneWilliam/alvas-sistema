import { Hono } from "hono";
import { UsuarioController, type BindingsUsuarios } from "./UsuarioController";

export const crearUsuarioRouter = () => {
  const router = new Hono<{ Bindings: BindingsUsuarios }>();
  const controller = new UsuarioController();

  router.post("/", (c) => controller.crear(c));

  return router;
};

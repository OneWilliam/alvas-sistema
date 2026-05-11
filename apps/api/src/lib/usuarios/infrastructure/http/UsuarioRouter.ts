import { Hono } from "hono";
import { UsuarioController, type BindingsUsuarios } from "./UsuarioController";

export const crearUsuarioRouter = () => {
  const router = new Hono<{ Bindings: BindingsUsuarios }>();
  const controller = new UsuarioController();

  router.get("/", (c) => controller.listar(c));
  router.post("/", (c) => controller.crear(c));
  router.get("/:idUsuario", (c) => controller.obtener(c));
  router.put("/:idUsuario", (c) => controller.actualizar(c));

  return router;
};

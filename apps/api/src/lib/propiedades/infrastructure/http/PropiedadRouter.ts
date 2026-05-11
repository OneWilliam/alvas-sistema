import { Hono } from "hono";
import { type SessionClaims, verifySessionMiddleware } from "../../../shared/infrastructure";
import { type IAutorizadorPropiedades } from "../../domain/ports";
import {
  PropiedadController,
  type BindingsPropiedades,
  type PropiedadControllerDeps,
} from "./PropiedadController";

export type PropiedadRouterDeps = Readonly<{
  autorizador: IAutorizadorPropiedades;
  controllerDeps: PropiedadControllerDeps;
}>;

export function crearPropiedadRouter(deps: PropiedadRouterDeps) {
  const router = new Hono<{
    Bindings: BindingsPropiedades;
    Variables: { authPayload: SessionClaims };
  }>();
  const controller = new PropiedadController(deps.autorizador, deps.controllerDeps);

  router.use("*", verifySessionMiddleware());
  router.get("/", (c) => controller.listar(c));
  router.post("/", (c) => controller.crear(c));

  return router;
}

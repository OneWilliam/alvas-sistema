import { Hono } from "hono";
import {
  type SessionClaims,
  requireRolesMiddleware,
  verifySessionMiddleware,
} from "../../../shared/infrastructure";
import {
  ReportesController,
  type BindingsReportes,
  type ReportesRouterDeps,
} from "./ReportesController";

export function crearReportesRouter(deps: ReportesRouterDeps) {
  const router = new Hono<{
    Bindings: BindingsReportes;
    Variables: { authPayload: SessionClaims };
  }>();
  const controller = new ReportesController(deps);

  router.use("*", verifySessionMiddleware());
  router.use("*", requireRolesMiddleware(["ADMIN"]));

  router.get("/estadisticas-globales", (c) => controller.estadisticasGlobales(c));
  router.get("/general", (c) => controller.reporteGeneral(c));

  return router;
}

import { type Context } from "hono";
import {
  type IObtenerEstadisticasGlobales,
  type IObtenerReporteGeneral,
} from "../../application";
import { type D1DatabaseLike, type SessionClaims } from "../../../shared/infrastructure";

export type BindingsReportes = {
  DB: D1DatabaseLike;
};

export type ReportesRouterDeps = {
  crearObtenerEstadisticasGlobales: (c: ContextoReportes) => IObtenerEstadisticasGlobales;
  crearObtenerReporteGeneral: (c: ContextoReportes) => IObtenerReporteGeneral;
};

type ContextoReportes = Context<{
  Bindings: BindingsReportes;
  Variables: { authPayload: SessionClaims };
}>;

export class ReportesController {
  constructor(private readonly deps: ReportesRouterDeps) {}

  async estadisticasGlobales(c: ContextoReportes): Promise<Response> {
    try {
      const useCase = this.deps.crearObtenerEstadisticasGlobales(c);
      const resultado = await useCase.ejecutar();

      if (!resultado.esExito) {
        return c.json(
          { success: false, message: resultado.error.message, code: resultado.error.codigo },
          400,
        );
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      console.error("ReportesController.estadisticasGlobales:", error);
      return c.json(
        { success: false, message: "Error interno", code: "REPORTES_ERROR_INTERNO" },
        500,
      );
    }
  }

  async reporteGeneral(c: ContextoReportes): Promise<Response> {
    try {
      const useCase = this.deps.crearObtenerReporteGeneral(c);
      const resultado = await useCase.ejecutar();

      if (!resultado.esExito) {
        return c.json(
          { success: false, message: resultado.error.message, code: resultado.error.codigo },
          400,
        );
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      console.error("ReportesController.reporteGeneral:", error);
      return c.json(
        { success: false, message: "Error interno", code: "REPORTES_ERROR_INTERNO" },
        500,
      );
    }
  }
}

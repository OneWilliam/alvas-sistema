import { type Context } from "hono";
import { type D1DatabaseLike, type SessionClaims } from "../../../shared/infrastructure";
import {
  ObtenerEstadisticasGlobalesUseCase,
  ObtenerReporteGeneralUseCase,
} from "../../application/use-cases";
import { type IConsultaVentasParaReportes } from "../../domain/ports/IConsultaVentasParaReportes";

export type BindingsReportes = {
  DB: D1DatabaseLike;
};

export type ReportesRouterDeps = {
  crearConsultaVentasParaReportes: (db: D1DatabaseLike) => IConsultaVentasParaReportes;
};

type ContextoReportes = Context<{
  Bindings: BindingsReportes;
  Variables: { authPayload: SessionClaims };
}>;

export class ReportesController {
  constructor(private readonly deps: ReportesRouterDeps) {}

  private consulta(c: ContextoReportes): IConsultaVentasParaReportes {
    return this.deps.crearConsultaVentasParaReportes(c.env.DB);
  }

  async estadisticasGlobales(c: ContextoReportes): Promise<Response> {
    try {
      const useCase = new ObtenerEstadisticasGlobalesUseCase(this.consulta(c));
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
      const useCase = new ObtenerReporteGeneralUseCase(this.consulta(c));
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

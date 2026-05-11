import {
  ObtenerEstadisticasGlobalesUseCase,
  ObtenerReporteGeneralUseCase,
} from "../lib/reportes/application";
import { type ReportesRouterDeps } from "../lib/reportes/infrastructure";
import { ConsultaVentasParaReportesAdapter } from "../lib/ventas/infrastructure/adapters/ConsultaVentasParaReportesAdapter";
import { D1VentasRepository } from "../lib/ventas/infrastructure";

export function crearReportesRouterDeps(): ReportesRouterDeps {
  return {
    crearObtenerEstadisticasGlobales: (c) =>
      new ObtenerEstadisticasGlobalesUseCase(
        new ConsultaVentasParaReportesAdapter(new D1VentasRepository(c.env.DB)),
      ),
    crearObtenerReporteGeneral: (c) =>
      new ObtenerReporteGeneralUseCase(
        new ConsultaVentasParaReportesAdapter(new D1VentasRepository(c.env.DB)),
      ),
  };
}

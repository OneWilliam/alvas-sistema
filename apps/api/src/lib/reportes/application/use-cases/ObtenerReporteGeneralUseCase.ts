import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";
import { ReporteGeneral } from "../../domain";
import { type IConsultaVentasParaReportes } from "../../domain/ports/IConsultaVentasParaReportes";
import { PorcentajeConversion } from "../../domain/value-objects/PorcentajeConversion";
import { type ReporteGeneralOutput } from "../dto/ReportesSalidaDTOs";
import { type IObtenerReporteGeneral } from "../ports/in";

export class ObtenerReporteGeneralUseCase implements CasoDeUso<
  void,
  Resultado<ReporteGeneralOutput, ErrorDeDominio>
>,
  IObtenerReporteGeneral
{
  constructor(private readonly consultaVentas: IConsultaVentasParaReportes) {}

  async ejecutar(): Promise<Resultado<ReporteGeneralOutput, ErrorDeDominio>> {
    try {
      const leads = await this.consultaVentas.listarLeadsParaReporte();
      const clientes = await this.consultaVentas.listarClientesParaReporte();
      const actividadReciente = await this.consultaVentas.obtenerActividadReciente(10);

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const leadsNuevosHoy = leads.filter((l) => l.creadoEn >= hoy).length;
      const porcentaje = PorcentajeConversion.desdeLeadsYClientes(clientes.length, leads.length);

      const citasPendientes = leads.reduce(
        (acc, lead) => acc + lead.citas.filter((c) => c.estado === "PENDIENTE").length,
        0,
      );

      const reporte = new ReporteGeneral(
        new Date(),
        {
          conversionRate: porcentaje.valorNumerico,
          leadsNuevosHoy,
          citasPendientes,
        },
        actividadReciente,
      );

      return resultadoExitoso({
        fechaGeneracion: reporte.fechaGeneracion,
        metricas: reporte.metricas,
        actividadReciente: reporte.actividadReciente,
      });
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

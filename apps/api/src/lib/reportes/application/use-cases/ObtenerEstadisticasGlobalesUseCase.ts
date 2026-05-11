import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";
import { EstadisticasGlobales } from "../../domain";
import { type IConsultaVentasParaReportes } from "../../domain/ports/IConsultaVentasParaReportes";
import { type EstadisticasGlobalesOutput } from "../dto/ReportesSalidaDTOs";

export class ObtenerEstadisticasGlobalesUseCase implements CasoDeUso<
  void,
  Resultado<EstadisticasGlobalesOutput, ErrorDeDominio>
> {
  constructor(private readonly consultaVentas: IConsultaVentasParaReportes) {}

  async ejecutar(): Promise<Resultado<EstadisticasGlobalesOutput, ErrorDeDominio>> {
    try {
      const leads = await this.consultaVentas.listarLeadsParaReporte();
      const clientes = await this.consultaVentas.listarClientesParaReporte();
      const asesores = await this.consultaVentas.listarAsesoresConTotalesLeads();

      const leadsPorEstado: Record<string, number> = {};
      leads.forEach((l) => {
        const estado = l.estado;
        leadsPorEstado[estado] = (leadsPorEstado[estado] || 0) + 1;
      });

      const estadisticas = new EstadisticasGlobales(
        leads.length,
        clientes.length,
        leadsPorEstado,
        asesores.length,
      );

      return resultadoExitoso({
        totalLeads: estadisticas.totalLeads,
        totalClientes: estadisticas.totalClientes,
        leadsPorEstado: estadisticas.leadsPorEstado,
        asesoresActivos: estadisticas.asesoresActivos,
      });
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

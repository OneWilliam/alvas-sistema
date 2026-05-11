import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";
import { type IVentasRepository } from "../../../ventas/domain/ports/IVentasRepository";

export type ReporteGeneralOutput = {
  fechaGeneracion: Date;
  metricas: {
    conversionRate: number;
    leadsNuevosHoy: number;
    citasPendientes: number;
  };
  actividadReciente: { idLead: string; evento: string; descripcion: string; fecha: string }[];
};

export class ObtenerReporteGeneralUseCase implements CasoDeUso<void, Resultado<ReporteGeneralOutput, ErrorDeDominio>> {
  constructor(private readonly repository: IVentasRepository) {}

  async ejecutar(): Promise<Resultado<ReporteGeneralOutput, ErrorDeDominio>> {
    try {
      const leads = await this.repository.listarLeads();
      const clientes = await this.repository.listarClientes();
      const actividadReciente = await this.repository.obtenerActividadReciente(10);
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const leadsNuevosHoy = leads.filter(l => l.creadoEn >= hoy).length;
      const totalLeads = leads.length || 1;
      const conversionRate = (clientes.length / totalLeads) * 100;

      const citasPendientes = leads.reduce((acc, lead) => 
        acc + lead.citas.filter(c => c.estado === "PENDIENTE").length, 0);

      return resultadoExitoso({
        fechaGeneracion: new Date(),
        metricas: {
          conversionRate,
          leadsNuevosHoy,
          citasPendientes,
        },
        actividadReciente,
      });
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

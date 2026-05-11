import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";
import { type IVentasRepository } from "../../../ventas/domain/ports/IVentasRepository";

export type EstadisticasGlobalesOutput = {
  totalLeads: number;
  totalClientes: number;
  leadsPorEstado: Record<string, number>;
  asesoresActivos: number;
};

export class ObtenerEstadisticasGlobalesUseCase implements CasoDeUso<void, Resultado<EstadisticasGlobalesOutput, ErrorDeDominio>> {
  constructor(private readonly repository: IVentasRepository) {}

  async ejecutar(): Promise<Resultado<EstadisticasGlobalesOutput, ErrorDeDominio>> {
    try {
      const leads = await this.repository.listarLeads();
      const clientes = await this.repository.listarClientes();
      const asesores = await this.repository.listarAsesoresConLeads();

      const leadsPorEstado: Record<string, number> = {};
      leads.forEach(l => {
        const estado = l.estado.valor;
        leadsPorEstado[estado] = (leadsPorEstado[estado] || 0) + 1;
      });

      return resultadoExitoso({
        totalLeads: leads.length,
        totalClientes: clientes.length,
        leadsPorEstado,
        asesoresActivos: asesores.length,
      });
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

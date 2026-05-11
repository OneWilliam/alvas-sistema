import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { type IdUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { ErrorDeDominio } from "../../../shared/domain";

export type EvaluarLeadParaAsignarOutput = IdUsuarioRef;

export class EvaluarLeadParaAsignarUseCase implements CasoDeUso<void, Resultado<EvaluarLeadParaAsignarOutput, ErrorDeDominio>> {
  constructor(private readonly ventasRepository: IVentasRepository) {}

  async ejecutar(): Promise<Resultado<EvaluarLeadParaAsignarOutput, ErrorDeDominio>> {
    try {
      const stats = await this.ventasRepository.listarAsesoresConLeads();

      if (stats.length === 0) {
        return resultadoFallido(new ErrorDeDominio("No hay asesores disponibles para asignación."));
      }

      // Lógica simple: asignar al que menos leads tiene
      const mejorAsesor = stats.reduce((prev, curr) => (prev.totalLeads < curr.totalLeads ? prev : curr));

      return resultadoExitoso(mejorAsesor.idAsesor);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

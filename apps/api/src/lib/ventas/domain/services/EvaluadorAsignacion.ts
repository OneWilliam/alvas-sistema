import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IVentasRepository } from "../ports/IVentasRepository";
import { type IdUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { ErrorDeDominio } from "../../../shared/domain";

export interface IEvaluadorAsignacion {
  evaluar(repository: IVentasRepository): Promise<Resultado<IdUsuarioRef, ErrorDeDominio>>;
}

export class EvaluadorAsignacionService implements IEvaluadorAsignacion {
  async evaluar(repository: IVentasRepository): Promise<Resultado<IdUsuarioRef, ErrorDeDominio>> {
    try {
      const stats = await repository.listarAsesoresConLeads();

      if (stats.length === 0) {
        return resultadoFallido(new ErrorDeDominio("No hay asesores disponibles para asignación."));
      }

      // Lógica simple: asignar al que menos leads tiene
      const mejorAsesor = stats.reduce((prev, curr) =>
        prev.totalLeads < curr.totalLeads ? prev : curr,
      );

      return resultadoExitoso(mejorAsesor.idAsesor);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

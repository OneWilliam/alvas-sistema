import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IdUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { ErrorDeDominio } from "../../../shared/domain";

export type AsesorStat = {
  idAsesor: string;
  totalLeads: number;
};

export interface IEvaluadorAsignacion {
  evaluar(stats: AsesorStat[]): Resultado<IdUsuarioRef, ErrorDeDominio>;
}

export class EvaluadorAsignacionService implements IEvaluadorAsignacion {
  evaluar(stats: AsesorStat[]): Resultado<IdUsuarioRef, ErrorDeDominio> {
    try {
      if (stats.length === 0) {
        return resultadoFallido(new ErrorDeDominio("No hay asesores disponibles para asignación."));
      }

      // Lógica simple: asignar al que menos leads tiene
      const mejorAsesor = stats.reduce((prev, curr) =>
        prev.totalLeads < curr.totalLeads ? prev : curr,
      );

      return resultadoExitoso(mejorAsesor.idAsesor as IdUsuarioRef);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

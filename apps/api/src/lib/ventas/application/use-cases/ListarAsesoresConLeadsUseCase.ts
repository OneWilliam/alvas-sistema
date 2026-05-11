import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { type IdUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { ErrorDeDominio } from "../../../shared/domain";

export type ListarAsesoresConLeadsOutput = {
  idAsesor: IdUsuarioRef;
  totalLeads: number;
}[];

export class ListarAsesoresConLeadsUseCase implements CasoDeUso<void, Resultado<ListarAsesoresConLeadsOutput, ErrorDeDominio>> {
  constructor(private readonly ventasRepository: IVentasRepository) {}

  async ejecutar(): Promise<Resultado<ListarAsesoresConLeadsOutput, ErrorDeDominio>> {
    try {
      const stats = await this.ventasRepository.listarAsesoresConLeads();

      return resultadoExitoso(stats);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

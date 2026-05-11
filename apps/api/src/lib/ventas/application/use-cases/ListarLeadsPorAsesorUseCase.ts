import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { Lead } from "../../domain/entities/Lead";
import { idUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { ErrorDeDominio } from "../../../shared/domain";

export type ListarLeadsPorAsesorInput = {
  idAsesor: string;
};

export type ListarLeadsPorAsesorOutput = Lead[];

export class ListarLeadsPorAsesorUseCase implements CasoDeUso<ListarLeadsPorAsesorInput, Resultado<ListarLeadsPorAsesorOutput, ErrorDeDominio>> {
  constructor(private readonly ventasRepository: IVentasRepository) {}

  async ejecutar(input: ListarLeadsPorAsesorInput): Promise<Resultado<ListarLeadsPorAsesorOutput, ErrorDeDominio>> {
    try {
      const leads = await this.ventasRepository.listarLeadsPorAsesor(idUsuarioRef(input.idAsesor));

      return resultadoExitoso(leads);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

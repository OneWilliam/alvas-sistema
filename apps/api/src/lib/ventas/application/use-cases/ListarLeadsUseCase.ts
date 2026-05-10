import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { Lead } from "../../domain/entities/Lead";
import { ErrorDeDominio } from "../../../shared/domain";

export type ListarLeadsInput = void;

export type ListarLeadsOutput = Lead[];

export class ListarLeadsUseCase implements CasoDeUso<ListarLeadsInput, Resultado<ListarLeadsOutput, ErrorDeDominio>> {
  constructor(private readonly ventasRepository: IVentasRepository) {}

  async ejecutar(): Promise<Resultado<ListarLeadsOutput, ErrorDeDominio>> {
    try {
      const leads = await this.ventasRepository.listarLeads();

      return resultadoExitoso(leads);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

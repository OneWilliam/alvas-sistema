import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { Cita } from "../../domain/entities/Cita";
import { ErrorDeDominio } from "../../../shared/domain";

export type ListarCitasInput = void;

export type ListarCitasOutput = Cita[];

export class ListarCitasUseCase implements CasoDeUso<ListarCitasInput, Resultado<ListarCitasOutput, ErrorDeDominio>> {
  constructor(private readonly ventasRepository: IVentasRepository) {}

  async ejecutar(): Promise<Resultado<ListarCitasOutput, ErrorDeDominio>> {
    try {
      const leads = await this.ventasRepository.listarLeads();
      const citas = leads.flatMap(lead => lead.citas);

      return resultadoExitoso(citas);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

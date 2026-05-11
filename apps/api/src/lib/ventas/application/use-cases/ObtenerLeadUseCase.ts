import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { idLead } from "../../domain/value-objects/Ids";
import { LeadNoEncontradoError } from "../../domain/errors";
import { type ObtenerLeadInputDTO } from "../dto/LeadDTOs";
import { type Lead } from "../../domain/entities/Lead";

export type ObtenerLeadInput = ObtenerLeadInputDTO;
export type ObtenerLeadOutput = Lead;

export class ObtenerLeadUseCase implements CasoDeUso<ObtenerLeadInput, Resultado<ObtenerLeadOutput, ErrorDeDominio>> {
  constructor(private readonly repository: IVentasRepository) {}

  async ejecutar(input: ObtenerLeadInput): Promise<Resultado<ObtenerLeadOutput, ErrorDeDominio>> {
    try {
      const lead = await this.repository.obtenerLeadPorId(idLead(input.id));
      if (!lead) {
        return resultadoFallido(new LeadNoEncontradoError(input.id));
      }

      return resultadoExitoso(lead);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

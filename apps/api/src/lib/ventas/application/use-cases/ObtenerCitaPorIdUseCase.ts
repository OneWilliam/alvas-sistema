import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { idLead, idCita } from "../../domain/value-objects/Ids";
import { type Cita } from "../../domain/entities/Cita";
import { LeadNoEncontradoError, CitaNoEncontradaError } from "../../domain/errors";
import { type ObtenerCitaPorIdInputDTO } from "../dto/LeadDTOs";

export type ObtenerCitaPorIdInput = ObtenerCitaPorIdInputDTO;
export type ObtenerCitaPorIdOutput = Cita;

export class ObtenerCitaPorIdUseCase implements CasoDeUso<ObtenerCitaPorIdInput, Resultado<ObtenerCitaPorIdOutput, ErrorDeDominio>> {
  constructor(private readonly repository: IVentasRepository) {}

  async ejecutar(input: ObtenerCitaPorIdInput): Promise<Resultado<ObtenerCitaPorIdOutput, ErrorDeDominio>> {
    try {
      const lead = await this.repository.obtenerLeadPorId(idLead(input.idLead));
      if (!lead) {
        return resultadoFallido(new LeadNoEncontradoError(input.idLead));
      }

      const cita = lead.obtenerCitaPorId(idCita(input.idCita));
      if (!cita) {
        return resultadoFallido(new CitaNoEncontradaError(input.idCita));
      }

      return resultadoExitoso(cita);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

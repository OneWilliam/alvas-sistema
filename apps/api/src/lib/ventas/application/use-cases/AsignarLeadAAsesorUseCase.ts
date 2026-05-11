import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { idLead } from "../../domain/value-objects/Ids";
import { LeadNoEncontradoError } from "../../domain/errors";
import { idUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { type AsignarLeadAAsesorInputDTO } from "../dto/LeadDTOs";

export type AsignarLeadAAsesorInput = AsignarLeadAAsesorInputDTO;
export type AsignarLeadAAsesorOutput = void;

export class AsignarLeadAAsesorUseCase implements CasoDeUso<AsignarLeadAAsesorInput, Resultado<AsignarLeadAAsesorOutput, ErrorDeDominio>> {
  constructor(private readonly repository: IVentasRepository) {}

  async ejecutar(input: AsignarLeadAAsesorInput): Promise<Resultado<AsignarLeadAAsesorOutput, ErrorDeDominio>> {
    try {
      const lead = await this.repository.obtenerLeadPorId(idLead(input.idLead));
      if (!lead) {
        return resultadoFallido(new LeadNoEncontradoError(input.idLead));
      }

      lead.cambiarAsesor(idUsuarioRef(input.idAsesor));

      await this.repository.guardarLead(lead);
      await this.repository.registrarActividad(lead.id, "LEAD_ASIGNADO_A_ASESOR", `Lead asignado al asesor ${input.idAsesor}`);

      return resultadoExitoso(undefined);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { Lead } from "../../domain/entities/Lead";
import { idUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";

export type RegistrarLeadInput = {
  nombre: string;
  email: string;
  telefono: string;
  tipo: string;
  idAsesor: string;
  idPropiedadInteres?: string;
};

export class RegistrarLeadUseCase implements CasoDeUso<RegistrarLeadInput, Resultado<Lead, ErrorDeDominio>> {
  constructor(
    private readonly repository: IVentasRepository,
    private readonly generadorId: IGeneradorId,
  ) {}

  async ejecutar(input: RegistrarLeadInput): Promise<Resultado<Lead, ErrorDeDominio>> {
    try {
      const lead = Lead.registrar({
        id: this.generadorId.generar(),
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
        tipo: input.tipo,
        idAsesor: idUsuarioRef(input.idAsesor),
        idPropiedadInteres: input.idPropiedadInteres,
      });

      await this.repository.guardarLead(lead);
      await this.repository.registrarActividad(lead.id, "LEAD_REGISTRADO", `Lead registrado por asesor ${input.idAsesor}`);

      return resultadoExitoso(lead);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

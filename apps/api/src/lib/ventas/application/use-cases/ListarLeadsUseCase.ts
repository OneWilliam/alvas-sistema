import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { Lead } from "../../domain/entities/Lead";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IVerificadorDePermisos } from "../../../auth/domain/ports/IVerificadorDePermisos";
import { idUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";

export type ListarLeadsInput = {
  idUsuarioEjecutor: string;
  rolEjecutor: string;
};

export type ListarLeadsOutput = Lead[];

export class ListarLeadsUseCase implements CasoDeUso<ListarLeadsInput, Resultado<ListarLeadsOutput, ErrorDeDominio>> {
  constructor(
    private readonly ventasRepository: IVentasRepository,
    private readonly verificadorPermisos: IVerificadorDePermisos,
  ) {}

  async ejecutar(input: ListarLeadsInput): Promise<Resultado<ListarLeadsOutput, ErrorDeDominio>> {
    try {
      if (this.verificadorPermisos.puedeVerLeadsGlobales(input.rolEjecutor)) {
        const leads = await this.ventasRepository.listarLeads();
        return resultadoExitoso(leads);
      }

      // Si no puede ver globales, solo ve los suyos
      const leads = await this.ventasRepository.listarLeadsPorAsesor(idUsuarioRef(input.idUsuarioEjecutor));
      return resultadoExitoso(leads);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

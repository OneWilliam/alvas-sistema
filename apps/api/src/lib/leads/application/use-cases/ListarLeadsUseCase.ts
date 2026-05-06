import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type ILeadRepository } from "../../domain/ports";
import { Lead } from "../../domain/entities";
import { idUsuarioRef } from "../../domain/value-objects";
import { type IVerificadorDePermisos } from "../../../auth/application/ports";

export type ListarLeadsInput = {
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

export class ListarLeadsUseCase implements CasoDeUso<ListarLeadsInput, Resultado<Lead[], ErrorDeDominio>> {
  constructor(
    private readonly leadRepository: ILeadRepository,
    private readonly verificadorPermisos: IVerificadorDePermisos,
  ) {}

  async ejecutar(input: ListarLeadsInput): Promise<Resultado<Lead[], ErrorDeDominio>> {
    try {
      const { usuarioAutenticado } = input;
      let leads: Lead[];

      if (this.verificadorPermisos.puedeVerLeadsGlobales(usuarioAutenticado.rol)) {
        leads = await this.leadRepository.listarTodos();
      } else {
        leads = await this.leadRepository.obtenerPorAsesor(idUsuarioRef(usuarioAutenticado.id));
      }

      return resultadoExitoso(leads);
    } catch (error) {
      if (error instanceof ErrorDeDominio) {
        return resultadoFallido(error);
      }
      throw error;
    }
  }
}

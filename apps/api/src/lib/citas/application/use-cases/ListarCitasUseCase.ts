import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type ICitaRepository } from "../../domain/ports";
import { Cita } from "../../domain/entities";
import { idUsuarioRef } from "../../domain/value-objects/IdUsuarioRef";
import { PoliticaDeCita } from "../../domain/services/PoliticaDeCita";

export type ListarCitasInput = {
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

export class ListarCitasUseCase implements CasoDeUso<ListarCitasInput, Resultado<Cita[], ErrorDeDominio>> {
  constructor(private readonly citaRepository: ICitaRepository) {}

  async ejecutar(input: ListarCitasInput): Promise<Resultado<Cita[], ErrorDeDominio>> {
    try {
      const { usuarioAutenticado } = input;
      let citas: Cita[];

      if (PoliticaDeCita.puedeVerTodasLasCitas(usuarioAutenticado.rol)) {
        citas = await this.citaRepository.listarTodos();
      } else {
        citas = await this.citaRepository.obtenerPorUsuario(idUsuarioRef(usuarioAutenticado.id));
      }

      return resultadoExitoso(citas);
    } catch (error) {
      if (error instanceof ErrorDeDominio) {
        return resultadoFallido(error);
      }
      throw error;
    }
  }
}

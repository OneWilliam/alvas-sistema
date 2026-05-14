import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { type IPropiedadRepository, type IAutorizadorPropiedades } from "../../domain/ports";
import { idPropiedad } from "../../domain/value-objects";
import { PropiedadError } from "../../domain/errors/PropiedadError";
import { type IEliminarPropiedad } from "../ports/in";

export type EliminarPropiedadInput = {
  idPropiedad: string;
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

export class EliminarPropiedadUseCase
  implements CasoDeUso<EliminarPropiedadInput, Resultado<void, PropiedadError>>, IEliminarPropiedad
{
  constructor(
    private readonly propiedadRepository: IPropiedadRepository,
    private readonly autorizador: IAutorizadorPropiedades,
  ) {}

  async ejecutar(input: EliminarPropiedadInput): Promise<Resultado<void, PropiedadError>> {
    try {
      if (!this.autorizador.puedeGestionarPropiedades(input.usuarioAutenticado.rol)) {
        return resultadoFallido(
          new PropiedadError("No tienes permisos para gestionar propiedades.", "SIN_PERMISOS"),
        );
      }

      if (!(await this.propiedadRepository.existePorId(idPropiedad(input.idPropiedad)))) {
        return resultadoFallido(new PropiedadError("Propiedad no encontrada.", "NO_ENCONTRADA"));
      }

      await this.propiedadRepository.eliminarPorId(idPropiedad(input.idPropiedad));
      return resultadoExitoso(undefined);
    } catch (error) {
      if (error instanceof PropiedadError) {
        return resultadoFallido(error);
      }
      throw error;
    }
  }
}

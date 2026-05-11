import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IPropiedadRepository } from "../../domain/ports";
import { Propiedad } from "../../domain/entities";
import { idUsuarioRef } from "../../domain/value-objects";
import { type IAutorizadorPropiedades } from "../../domain/ports";
import { type IListarPropiedades } from "../ports/in";

export type ListarPropiedadesInput = {
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

export class ListarPropiedadesUseCase implements CasoDeUso<
  ListarPropiedadesInput,
  Resultado<Propiedad[], ErrorDeDominio>
>,
  IListarPropiedades
{
  constructor(
    private readonly propiedadRepository: IPropiedadRepository,
    private readonly autorizador: IAutorizadorPropiedades,
  ) {}

  async ejecutar(input: ListarPropiedadesInput): Promise<Resultado<Propiedad[], ErrorDeDominio>> {
    try {
      const { usuarioAutenticado } = input;
      let propiedades: Propiedad[];

      if (this.autorizador.puedeVerPropiedadesGlobales(usuarioAutenticado.rol)) {
        propiedades = await this.propiedadRepository.listarTodas();
      } else {
        propiedades = await this.propiedadRepository.obtenerPorAsesor(
          idUsuarioRef(usuarioAutenticado.id),
        );
      }

      return resultadoExitoso(propiedades);
    } catch (error) {
      if (error instanceof ErrorDeDominio) {
        return resultadoFallido(error);
      }
      throw error;
    }
  }
}

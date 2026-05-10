import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IPropiedadRepository } from "../../domain/ports";
import { Propiedad } from "../../domain/entities";
import { idUsuarioRef } from "../../domain/value-objects";
import { type IVerificadorDePermisos } from "../../../auth/domain/ports";

export type ListarPropiedadesInput = {
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

export class ListarPropiedadesUseCase implements CasoDeUso<ListarPropiedadesInput, Resultado<Propiedad[], ErrorDeDominio>> {
  constructor(
    private readonly propiedadRepository: IPropiedadRepository,
    private readonly verificadorPermisos: IVerificadorDePermisos,
  ) {}

  async ejecutar(input: ListarPropiedadesInput): Promise<Resultado<Propiedad[], ErrorDeDominio>> {
    try {
      const { usuarioAutenticado } = input;
      let propiedades: Propiedad[];

      if (this.verificadorPermisos.puedeVerPropiedadesGlobales(usuarioAutenticado.rol)) {
        propiedades = await this.propiedadRepository.listarTodas();
      } else {
        propiedades = await this.propiedadRepository.obtenerPorAsesor(idUsuarioRef(usuarioAutenticado.id));
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

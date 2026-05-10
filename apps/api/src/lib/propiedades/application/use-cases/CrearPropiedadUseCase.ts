import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IPropiedadRepository } from "../../domain/ports";
import { Propiedad } from "../../domain/entities";
import { idUsuarioRef } from "../../domain/value-objects";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";
import { type IVerificadorDePermisos } from "../../../auth/domain/ports";
import { PropiedadError } from "../../domain/errors/PropiedadError";

export type CrearPropiedadInput = {
  titulo: string;
  descripcion: string;
  precio: number;
  idAsesor: string;
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

export class CrearPropiedadUseCase implements CasoDeUso<CrearPropiedadInput, Resultado<Propiedad, PropiedadError>> {
  constructor(
    private readonly propiedadRepository: IPropiedadRepository,
    private readonly generadorId: IGeneradorId,
    private readonly verificadorPermisos: IVerificadorDePermisos,
  ) {}

  async ejecutar(input: CrearPropiedadInput): Promise<Resultado<Propiedad, PropiedadError>> {
    try {
      const { usuarioAutenticado } = input;

      if (!this.verificadorPermisos.esPropietarioDePropiedad(usuarioAutenticado.id, input.idAsesor)) {
        return resultadoFallido(new PropiedadError("No tienes permisos para asignar esta propiedad.", "SIN_PERMISOS"));
      }

      const idAsesor = idUsuarioRef(input.idAsesor);
      const propiedad = Propiedad.crear({
        id: this.generadorId.generar(),
        titulo: input.titulo,
        descripcion: input.descripcion,
        precio: input.precio,
        idAsesor,
      });

      await this.propiedadRepository.guardar(propiedad);
      return resultadoExitoso(propiedad);
    } catch (error) {
      if (error instanceof PropiedadError) {
        return resultadoFallido(error);
      }
      throw error;
    }
  }
}

import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import {
  type IPropiedadRepository,
  type IAutorizadorPropiedades,
  type IConsultaRelacionPropiedad,
} from "../../domain/ports";
import { idPropiedad } from "../../domain/value-objects";
import { PropiedadError } from "../../domain/errors/PropiedadError";
import { type ActualizarPropiedadDTO } from "../dto/PropiedadDTOs";
import { type IActualizarPropiedad } from "../ports/in";

export type ActualizarPropiedadInput = ActualizarPropiedadDTO & {
  idPropiedad: string;
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

export class ActualizarPropiedadUseCase
  implements
    CasoDeUso<ActualizarPropiedadInput, Resultado<void, PropiedadError>>,
    IActualizarPropiedad
{
  constructor(
    private readonly propiedadRepository: IPropiedadRepository,
    private readonly autorizador: IAutorizadorPropiedades,
    private readonly consultaRelacionPropiedad: IConsultaRelacionPropiedad,
  ) {}

  async ejecutar(input: ActualizarPropiedadInput): Promise<Resultado<void, PropiedadError>> {
    try {
      const propiedad = await this.propiedadRepository.obtenerPorId(idPropiedad(input.idPropiedad));
      if (!propiedad) {
        return resultadoFallido(new PropiedadError("Propiedad no encontrada.", "NO_ENCONTRADA"));
      }

      const puedeEditar = await this.puedeEditar(input.usuarioAutenticado, {
        idLeadOrigen: propiedad.idLeadOrigen,
        idClientePropietario: propiedad.idClientePropietario,
      });
      if (!puedeEditar) {
        return resultadoFallido(
          new PropiedadError("No tienes permisos para editar esta propiedad.", "SIN_PERMISOS"),
        );
      }

      propiedad.actualizar({
        titulo: input.titulo,
        descripcion: input.descripcion,
        precio: input.precio,
        estado: input.estado,
        idClientePropietario: input.idClientePropietario,
        asesorResponsableId: input.asesorResponsableId,
      });

      await this.propiedadRepository.guardar(propiedad);
      return resultadoExitoso(undefined);
    } catch (error) {
      if (error instanceof PropiedadError) {
        return resultadoFallido(error);
      }
      throw error;
    }
  }

  private async puedeEditar(
    usuarioAutenticado: ActualizarPropiedadInput["usuarioAutenticado"],
    relacion: { idLeadOrigen?: string; idClientePropietario?: string },
  ): Promise<boolean> {
    if (this.autorizador.puedeGestionarPropiedades(usuarioAutenticado.rol)) {
      return true;
    }

    if (!this.autorizador.puedeEditarPropiedadRelacionada(usuarioAutenticado.rol)) {
      return false;
    }

    return this.consultaRelacionPropiedad.asesorGestionaPropiedad(usuarioAutenticado.id, relacion);
  }
}

import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { type IConsultaRelacionPropiedad, type IPropiedadRepository } from "../../domain/ports";
import { Propiedad } from "../../domain/entities";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";
import { type IAutorizadorPropiedades } from "../../domain/ports";
import { PropiedadError } from "../../domain/errors/PropiedadError";
import { type ICrearPropiedad } from "../ports/in";

export type CrearPropiedadInput = {
  titulo: string;
  descripcion: string;
  precio: number;
  origen?: string;
  estado?: string;
  idLeadOrigen?: string;
  idClientePropietario?: string;
  captadaPorAsesorId?: string;
  asesorResponsableId?: string;
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

export class CrearPropiedadUseCase
  implements CasoDeUso<CrearPropiedadInput, Resultado<Propiedad, PropiedadError>>, ICrearPropiedad
{
  constructor(
    private readonly propiedadRepository: IPropiedadRepository,
    private readonly generadorId: IGeneradorId,
    private readonly autorizador: IAutorizadorPropiedades,
    private readonly consultaRelacionPropiedad: IConsultaRelacionPropiedad,
  ) {}

  async ejecutar(input: CrearPropiedadInput): Promise<Resultado<Propiedad, PropiedadError>> {
    try {
      const { usuarioAutenticado } = input;

      const puedeCrear = await this.puedeCrear(input);
      if (!puedeCrear) {
        return resultadoFallido(
          new PropiedadError("No tienes permisos para crear esta propiedad.", "SIN_PERMISOS"),
        );
      }

      const propiedad = Propiedad.crear({
        id: this.generadorId.generar(),
        titulo: input.titulo,
        descripcion: input.descripcion,
        precio: input.precio,
        origen: input.origen,
        estado: input.estado,
        idLeadOrigen: input.idLeadOrigen,
        idClientePropietario: input.idClientePropietario,
        captadaPorAsesorId: input.captadaPorAsesorId,
        asesorResponsableId: input.asesorResponsableId,
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

  private async puedeCrear(input: CrearPropiedadInput): Promise<boolean> {
    if (this.autorizador.puedeGestionarPropiedades(input.usuarioAutenticado.rol)) {
      return true;
    }

    if (!this.autorizador.puedeEditarPropiedadRelacionada(input.usuarioAutenticado.rol)) {
      return false;
    }

    return this.consultaRelacionPropiedad.asesorGestionaPropiedad(input.usuarioAutenticado.id, {
      idLeadOrigen: input.idLeadOrigen,
      idClientePropietario: input.idClientePropietario,
    });
  }
}

import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { type IAutorizadorVentas } from "../../domain/ports/IAutorizadorVentas";
import { idLead } from "../../domain/value-objects/Ids";
import { type IConsultaPropiedadInteres } from "../../domain/ports/IConsultaPropiedadInteres";
import { type IActualizarLead } from "../ports/in";
import { type UsuarioAutenticadoVentas } from "./RegistrarLeadUseCase";

export type ActualizarLeadInput = {
  id: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
  idPropiedadInteres?: string;
  usuarioAutenticado?: UsuarioAutenticadoVentas;
};

export class ActualizarLeadUseCase
  implements CasoDeUso<ActualizarLeadInput, Resultado<void, ErrorDeDominio>>, IActualizarLead
{
  constructor(
    private readonly repository: IVentasRepository,
    private readonly autorizador?: IAutorizadorVentas,
    private readonly consultaPropiedadInteres?: IConsultaPropiedadInteres,
  ) {}

  async ejecutar(input: ActualizarLeadInput): Promise<Resultado<void, ErrorDeDominio>> {
    try {
      const lead = await this.repository.obtenerLeadPorId(idLead(input.id));
      if (!lead)
        return resultadoFallido(
          new ErrorDeDominio("Lead no encontrado", { codigo: "LEAD_NOT_FOUND" }),
        );

      if (
        input.usuarioAutenticado &&
        this.autorizador &&
        !this.autorizador.puedeGestionarLead(
          input.usuarioAutenticado.rol,
          input.usuarioAutenticado.id,
          lead.idAsesor as string,
        )
      ) {
        return resultadoFallido(
          new ErrorDeDominio("No tienes permisos para gestionar este lead.", {
            codigo: "SIN_PERMISOS_LEAD",
          }),
        );
      }

      const validacionPropiedad = await this.validarPropiedadInteres(input, lead.tipo.valor);
      if (!validacionPropiedad.esExito) {
        return validacionPropiedad;
      }

      lead.actualizarDatos({
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
        tipo: input.tipo,
      });

      if (input.idPropiedadInteres !== undefined) {
        lead.actualizarDatosPropiedad(input.idPropiedadInteres);
      }

      await this.repository.guardarLead(lead);
      await this.repository.registrarActividad(
        lead.id,
        "LEAD_ACTUALIZADO",
        "Datos del lead actualizados desde el agregado.",
      );

      return resultadoExitoso(undefined);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }

  private async validarPropiedadInteres(
    input: ActualizarLeadInput,
    tipoActual: string,
  ): Promise<Resultado<void, ErrorDeDominio>> {
    if (input.idPropiedadInteres === undefined) {
      return resultadoExitoso(undefined);
    }

    const tipoFinal = (input.tipo ?? tipoActual).trim().toUpperCase();
    if (tipoFinal !== "COMPRA") {
      return resultadoFallido(
        new ErrorDeDominio("Solo los leads compradores pueden relacionarse con una propiedad.", {
          codigo: "PROPIEDAD_INTERES_NO_APLICA",
        }),
      );
    }

    if (!this.consultaPropiedadInteres) {
      return resultadoExitoso(undefined);
    }

    const disponible = await this.consultaPropiedadInteres.propiedadDisponibleParaCompra(
      input.idPropiedadInteres,
    );

    if (!disponible) {
      return resultadoFallido(
        new ErrorDeDominio("La propiedad de interes no esta disponible para compradores.", {
          codigo: "PROPIEDAD_INTERES_NO_DISPONIBLE",
        }),
      );
    }

    return resultadoExitoso(undefined);
  }
}

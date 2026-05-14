import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { Lead } from "../../domain/entities/Lead";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";
import { type IRegistrarLead } from "../ports/in";
import { type RegistrarLeadInputDTO } from "../dto/LeadDTOs";
import { type IEvaluadorAsignacion } from "../../domain/services/EvaluadorAsignacion";
import { type IAutorizadorVentas } from "../../domain/ports/IAutorizadorVentas";
import { type IConsultaPropiedadInteres } from "../../domain/ports/IConsultaPropiedadInteres";

export type UsuarioAutenticadoVentas = {
  id: string;
  rol: string;
};

export type RegistrarLeadInput = RegistrarLeadInputDTO & {
  usuarioAutenticado?: UsuarioAutenticadoVentas;
};

export class RegistrarLeadUseCase
  implements CasoDeUso<RegistrarLeadInput, Resultado<Lead, ErrorDeDominio>>, IRegistrarLead
{
  constructor(
    private readonly repository: IVentasRepository,
    private readonly generadorId: IGeneradorId,
    private readonly evaluarAsignacion: IEvaluadorAsignacion,
    private readonly autorizador?: IAutorizadorVentas,
    private readonly consultaPropiedadInteres?: IConsultaPropiedadInteres,
  ) {}

  async ejecutar(input: RegistrarLeadInput): Promise<Resultado<Lead, ErrorDeDominio>> {
    try {
      let idAsesorFinal = input.idAsesor;

      if (input.usuarioAutenticado) {
        const puedeAsignarOtroAsesor = input.usuarioAutenticado.rol === "ADMIN" && !!input.idAsesor;
        idAsesorFinal = puedeAsignarOtroAsesor ? input.idAsesor : input.usuarioAutenticado.id;
      }

      // Si no se provee asesor, asignar automáticamente
      if (!idAsesorFinal) {
        const stats = await this.repository.listarAsesoresConLeads();
        const resultadoAsignacion = this.evaluarAsignacion.evaluar(stats);
        if (resultadoAsignacion.esExito) {
          idAsesorFinal = resultadoAsignacion.valor;
        } else {
          // Si falla la asignación automática, podemos registrarlo sin asesor o fallar
          // Para este sistema, usaremos un asesor por defecto o lanzaremos error
          return resultadoFallido(
            new ErrorDeDominio("No se pudo asignar un asesor automáticamente."),
          );
        }
      }

      if (
        input.usuarioAutenticado &&
        this.autorizador &&
        !this.autorizador.puedeGestionarLead(
          input.usuarioAutenticado.rol,
          input.usuarioAutenticado.id,
          idAsesorFinal,
        )
      ) {
        return resultadoFallido(
          new ErrorDeDominio("No tienes permisos para gestionar este lead.", {
            codigo: "SIN_PERMISOS_LEAD",
          }),
        );
      }

      const validacionPropiedad = await this.validarPropiedadInteres(input);
      if (!validacionPropiedad.esExito) {
        return validacionPropiedad;
      }

      const lead = Lead.registrar({
        id: this.generadorId.generar(),
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
        tipo: input.tipo,
        idAsesor: idAsesorFinal,
        idPropiedadInteres: input.idPropiedadInteres,
      });

      await this.repository.guardarLead(lead);
      await this.repository.registrarActividad(
        lead.id,
        "LEAD_REGISTRADO",
        `Lead registrado y asignado a asesor ${idAsesorFinal}`,
      );

      return resultadoExitoso(lead);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }

  private async validarPropiedadInteres(
    input: RegistrarLeadInput,
  ): Promise<Resultado<void, ErrorDeDominio>> {
    if (!input.idPropiedadInteres) {
      return resultadoExitoso(undefined);
    }

    if (input.tipo.trim().toUpperCase() !== "COMPRA") {
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

import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { type IAutorizadorVentas } from "../../domain/ports/IAutorizadorVentas";
import { idCita, idLead } from "../../domain/value-objects/Ids";
import { type IActualizarCita } from "../ports/in";
import { type UsuarioAutenticadoVentas } from "./RegistrarLeadUseCase";

export type ActualizarCitaInput = {
  idLead: string;
  idCita: string;
  fechaInicio?: Date;
  duracionMinutos?: number;
  observacion?: string;
  estado?: string;
  usuarioAutenticado?: UsuarioAutenticadoVentas;
};

export class ActualizarCitaUseCase
  implements CasoDeUso<ActualizarCitaInput, Resultado<void, ErrorDeDominio>>, IActualizarCita
{
  constructor(
    private readonly repository: IVentasRepository,
    private readonly autorizador?: IAutorizadorVentas,
  ) {}

  async ejecutar(input: ActualizarCitaInput): Promise<Resultado<void, ErrorDeDominio>> {
    try {
      const lead = await this.repository.obtenerLeadPorId(idLead(input.idLead));
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

      if (!lead.obtenerCitaPorId(idCita(input.idCita))) {
        return resultadoFallido(
          new ErrorDeDominio("Cita no encontrada", { codigo: "CITA_NOT_FOUND" }),
        );
      }

      lead.actualizarCita({
        idCita: idCita(input.idCita),
        fechaInicio: input.fechaInicio,
        duracionMinutos: input.duracionMinutos,
        observacion: input.observacion,
        estado: input.estado,
      });

      await this.repository.guardarLead(lead);
      await this.repository.registrarActividad(
        lead.id,
        "CITA_ACTUALIZADA",
        `Cita ${input.idCita} actualizada desde el agregado.`,
      );

      return resultadoExitoso(undefined);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

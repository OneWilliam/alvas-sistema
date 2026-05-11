import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { Cita } from "../../domain/entities/Cita";
import { idLead, idCita } from "../../domain/value-objects/Ids";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";
import { type IAgendarCita } from "../ports/in";

export type AgendarCitaInput = {
  idLead: string;
  idPropiedad?: string;
  fechaInicio: Date;
  duracionMinutos: number;
  observacion?: string;
};

export class AgendarCitaUseCase implements CasoDeUso<
  AgendarCitaInput,
  Resultado<void, ErrorDeDominio>
>,
  IAgendarCita
{
  constructor(
    private readonly repository: IVentasRepository,
    private readonly generadorId: IGeneradorId,
  ) {}

  async ejecutar(input: AgendarCitaInput): Promise<Resultado<void, ErrorDeDominio>> {
    try {
      const lead = await this.repository.obtenerLeadPorId(idLead(input.idLead));
      if (!lead)
        return resultadoFallido(
          new ErrorDeDominio("Lead no encontrado", { codigo: "LEAD_NO_ENCONTRADO" }),
        );

      const fechaFin = new Date(input.fechaInicio.getTime() + input.duracionMinutos * 60000);

      const cita = Cita.crear({
        id: idCita(this.generadorId.generar()),
        idLead: lead.id,
        idPropiedad: input.idPropiedad,
        fechaInicio: input.fechaInicio,
        fechaFin: fechaFin,
        estado: "PENDIENTE",
        observacion: input.observacion,
      });

      lead.agendarCita(cita);
      await this.repository.guardarLead(lead);
      await this.repository.registrarActividad(
        lead.id,
        "CITA_AGENDADA",
        `Cita agendada para el ${input.fechaInicio.toLocaleString()}`,
      );

      return resultadoExitoso(undefined);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

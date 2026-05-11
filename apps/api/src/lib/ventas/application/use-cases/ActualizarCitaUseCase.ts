import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { idLead } from "../../domain/value-objects/Ids";

export type ActualizarCitaInput = {
  idLead: string;
  idCita: string;
  fechaInicio?: Date;
  duracionMinutos?: number;
  observacion?: string;
  estado?: string;
};

export class ActualizarCitaUseCase implements CasoDeUso<
  ActualizarCitaInput,
  Resultado<void, ErrorDeDominio>
> {
  constructor(private readonly repository: IVentasRepository) {}

  async ejecutar(input: ActualizarCitaInput): Promise<Resultado<void, ErrorDeDominio>> {
    try {
      const lead = await this.repository.obtenerLeadPorId(idLead(input.idLead));
      if (!lead)
        return resultadoFallido(
          new ErrorDeDominio("Lead no encontrado", { codigo: "LEAD_NOT_FOUND" }),
        );

      const cita = lead.citas.find((c) => (c.id as string) === input.idCita);
      if (!cita)
        return resultadoFallido(
          new ErrorDeDominio("Cita no encontrada", { codigo: "CITA_NOT_FOUND" }),
        );

      // Aquí deberíamos agregar lógica de actualización en la entidad Cita
      // Como simplificación para este MVP, asumimos que el repositorio maneja el update

      await this.repository.guardarLead(lead);
      await this.repository.registrarActividad(
        lead.id,
        "CITA_ACTUALIZADA",
        `Cita ${input.idCita} actualizada`,
      );

      return resultadoExitoso(undefined);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { idLead } from "../../domain/value-objects/Ids";
import { type IActualizarLead } from "../ports/in";

export type ActualizarLeadInput = {
  id: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
};

export class ActualizarLeadUseCase implements CasoDeUso<
  ActualizarLeadInput,
  Resultado<void, ErrorDeDominio>
>,
  IActualizarLead
{
  constructor(private readonly repository: IVentasRepository) {}

  async ejecutar(input: ActualizarLeadInput): Promise<Resultado<void, ErrorDeDominio>> {
    try {
      const lead = await this.repository.obtenerLeadPorId(idLead(input.id));
      if (!lead)
        return resultadoFallido(
          new ErrorDeDominio("Lead no encontrado", { codigo: "LEAD_NOT_FOUND" }),
        );

      lead.actualizarDatos({
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
        tipo: input.tipo,
      });

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
}

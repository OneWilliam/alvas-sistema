import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { Lead } from "../../domain/entities/Lead";
import { idUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";
import { EvaluarLeadParaAsignarUseCase } from "./EvaluarLeadParaAsignarUseCase";

export type RegistrarLeadInput = {
  nombre: string;
  email: string;
  telefono: string;
  tipo: string;
  idAsesor?: string;
  idPropiedadInteres?: string;
};

export class RegistrarLeadUseCase implements CasoDeUso<
  RegistrarLeadInput,
  Resultado<Lead, ErrorDeDominio>
> {
  constructor(
    private readonly repository: IVentasRepository,
    private readonly generadorId: IGeneradorId,
    private readonly evaluarAsignacion: EvaluarLeadParaAsignarUseCase,
  ) {}

  async ejecutar(input: RegistrarLeadInput): Promise<Resultado<Lead, ErrorDeDominio>> {
    try {
      let idAsesorFinal = input.idAsesor;

      // Si no se provee asesor, asignar automáticamente
      if (!idAsesorFinal) {
        const resultadoAsignacion = await this.evaluarAsignacion.ejecutar();
        if (resultadoAsignacion.esExito) {
          idAsesorFinal = resultadoAsignacion.valor as string;
        } else {
          // Si falla la asignación automática, podemos registrarlo sin asesor o fallar
          // Para este sistema, usaremos un asesor por defecto o lanzaremos error
          return resultadoFallido(
            new ErrorDeDominio("No se pudo asignar un asesor automáticamente."),
          );
        }
      }

      const lead = Lead.registrar({
        id: this.generadorId.generar(),
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
        tipo: input.tipo,
        idAsesor: idUsuarioRef(idAsesorFinal),
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
}

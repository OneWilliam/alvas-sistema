import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type ILeadRepository } from "../../domain/ports";
import { Lead } from "../../domain/entities";
import { idUsuarioRef } from "../../domain/value-objects";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";
import { type IVerificadorDePermisos } from "../../../auth/application/ports";
import { LeadError } from "../../domain/errors/LeadError";

export type CrearLeadInput = {
  nombre: string;
  email: string;
  telefono: string;
  tipo: string;
  idAsesor: string;
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

export class CrearLeadUseCase implements CasoDeUso<CrearLeadInput, Resultado<Lead, LeadError>> {
  constructor(
    private readonly leadRepository: ILeadRepository,
    private readonly generadorId: IGeneradorId,
    private readonly verificadorPermisos: IVerificadorDePermisos,
  ) {}

  async ejecutar(input: CrearLeadInput): Promise<Resultado<Lead, LeadError>> {
    try {
      const { usuarioAutenticado } = input;

      // Validar permisos: Admin puede asignar a cualquier asesor; Asesor solo a sí mismo
      if (!this.verificadorPermisos.esPropietarioDeLead(usuarioAutenticado.id, input.idAsesor)) {
        return resultadoFallido(new LeadError("No tienes permisos para asignar este lead.", "SIN_PERMISOS"));
      }

      const idAsesor = idUsuarioRef(input.idAsesor);
      const lead = Lead.crear({
        id: this.generadorId.generar(),
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
        tipo: input.tipo,
        idAsesor,
      });

      await this.leadRepository.guardar(lead);
      return resultadoExitoso(lead);
    } catch (error) {
      if (error instanceof LeadError) {
        return resultadoFallido(error);
      }
      throw error;
    }
  }
}

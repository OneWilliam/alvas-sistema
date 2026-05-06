import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio, ErrorDeValidacion } from "../../../shared/domain";
import { type ICitaRepository } from "../../domain/ports";
import { Cita } from "../../domain/entities";
import { type IdUsuarioRef, idUsuarioRef } from "../../domain/value-objects/IdUsuarioRef";
import { type CrearCitaDTO } from "../dto/CitaDTOs";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";
import { PoliticaDeCita } from "../../domain/services/PoliticaDeCita";

export type CrearCitaInput = {
  dto: CrearCitaDTO;
  usuarioAutenticado: {
    id: string;
    rol: string;
  };
};

export class CrearCitaUseCase implements CasoDeUso<CrearCitaInput, Resultado<Cita, ErrorDeDominio>> {
  constructor(
    private readonly citaRepository: ICitaRepository,
    private readonly generadorId: IGeneradorId
  ) {}

  async ejecutar(input: CrearCitaInput): Promise<Resultado<Cita, ErrorDeDominio>> {
    try {
      const { dto, usuarioAutenticado } = input;

      // Regla de Negocio: Un asesor solo puede crear citas para sí mismo.
      // El administrador puede crear citas para cualquier asesor.
      if (!PoliticaDeCita.puedeCrearParaOtroUsuario(usuarioAutenticado.rol) && usuarioAutenticado.id !== dto.idUsuario) {
        throw new ErrorDeDominio("No tienes permisos para crear una cita para otro usuario.", {
          codigo: "SIN_PERMISOS",
        });
      }

      const fechaInicio = new Date(dto.fechaInicio);
      if (isNaN(fechaInicio.getTime())) {
        throw new ErrorDeValidacion("La fecha de inicio no es válida.");
      }

      if (fechaInicio < new Date()) {
        throw new ErrorDeValidacion("No se pueden agendar citas en el pasado.");
      }

      const idUsuario = idUsuarioRef(dto.idUsuario);
      const duracion = dto.duracionMinutos || 60;
      const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);

      // Verificar disponibilidad (traslapes)
      const hayTraslape = await this.citaRepository.existeTraslape(idUsuario, fechaInicio, fechaFin);
      if (hayTraslape) {
        throw new ErrorDeValidacion("El usuario ya tiene una cita agendada en ese horario.");
      }

      const cita = Cita.crear({
        id: this.generadorId.generar(),
        idLead: dto.idLead,
        idUsuario: dto.idUsuario,
        idPropiedad: dto.idPropiedad,
        fechaInicio,
        duracionMinutos: duracion,
        observacion: dto.observacion,
      });

      await this.citaRepository.guardar(cita);

      return resultadoExitoso(cita);
    } catch (error) {
      if (error instanceof ErrorDeDominio) {
        return resultadoFallido(error);
      }
      throw error;
    }
  }
}

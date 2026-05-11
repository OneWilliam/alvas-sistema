import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";
import { type IContratoRepository } from "../../domain/ports/IContratoRepository";
import { Contrato } from "../../domain/entities/Contrato";
import { type CrearContratoInputDTO } from "../dto/ContratoDTOs";
import { type ContratoOutputDTO } from "../dto/ContratoDTOs";
import { idContrato, idCliente, idPropiedad } from "../../domain/value-objects/Ids";

export type CrearContratoInput = CrearContratoInputDTO;
export type CrearContratoOutput = ContratoOutputDTO;

export class CrearContratoUseCase implements CasoDeUso<
  CrearContratoInput,
  Resultado<CrearContratoOutput, ErrorDeDominio>
> {
  constructor(private readonly repository: IContratoRepository) {}

  async ejecutar(
    input: CrearContratoInput,
  ): Promise<Resultado<CrearContratoOutput, ErrorDeDominio>> {
    try {
      const contrato = Contrato.crear({
        id: idContrato(input.id),
        idCliente: idCliente(input.idCliente),
        idPropiedad: idPropiedad(input.idPropiedad),
        fechaInicio: input.fechaInicio,
        fechaFin: input.fechaFin,
      });

      await this.repository.guardar(contrato);

      const output: ContratoOutputDTO = {
        id: contrato.id as string,
        idCliente: contrato.idCliente as string,
        idPropiedad: contrato.idPropiedad,
        fechaInicio: contrato.fechaInicio.toISOString(),
        fechaFin: contrato.fechaFin.toISOString(),
        estado: contrato.estado,
        creadoEn: contrato.creadoEn.toISOString(),
        actualizadoEn: contrato.actualizadoEn.toISOString(),
      };

      return resultadoExitoso(output);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IContratoRepository } from "../../domain/ports/IContratoRepository";
import { type ListarContratosOutputDTO } from "../dto/ContratoDTOs";

export type ListarContratosInput = void;
export type ListarContratosOutput = ListarContratosOutputDTO;

export class ListarContratosUseCase implements CasoDeUso<
  ListarContratosInput,
  Resultado<ListarContratosOutput, ErrorDeDominio>
> {
  constructor(private readonly repository: IContratoRepository) {}

  async ejecutar(): Promise<Resultado<ListarContratosOutput, ErrorDeDominio>> {
    try {
      const contratos = await this.repository.listar();

      const output: ListarContratosOutputDTO = {
        contratos: contratos.map((contrato) => ({
          id: contrato.id as string,
          idCliente: contrato.idCliente as string,
          idPropiedad: contrato.idPropiedad,
          fechaInicio: contrato.fechaInicio.toISOString(),
          fechaFin: contrato.fechaFin.toISOString(),
          estado: contrato.estado,
          creadoEn: contrato.creadoEn.toISOString(),
          actualizadoEn: contrato.actualizadoEn.toISOString(),
        })),
      };

      return resultadoExitoso(output);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

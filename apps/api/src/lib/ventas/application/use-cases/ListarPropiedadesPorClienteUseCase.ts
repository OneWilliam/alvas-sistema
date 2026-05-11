import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IContratoRepository } from "../../domain/ports/IContratoRepository";
import { idCliente, type IdPropiedad } from "../../domain/value-objects/Ids";
import { ErrorDeDominio } from "../../../shared/domain";

export type ListarPropiedadesPorClienteInput = {
  idCliente: string;
};

export type ListarPropiedadesPorClienteOutput = IdPropiedad[];

export class ListarPropiedadesPorClienteUseCase implements CasoDeUso<ListarPropiedadesPorClienteInput, Resultado<ListarPropiedadesPorClienteOutput, ErrorDeDominio>> {
  constructor(private readonly contratoRepository: IContratoRepository) {}

  async ejecutar(input: ListarPropiedadesPorClienteInput): Promise<Resultado<ListarPropiedadesPorClienteOutput, ErrorDeDominio>> {
    try {
      const contratos = await this.contratoRepository.listarPorCliente(idCliente(input.idCliente));
      const propiedadIds = contratos.map(c => c.idPropiedad);

      // Eliminar duplicados
      const uniqueIds = Array.from(new Set(propiedadIds));

      return resultadoExitoso(uniqueIds);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

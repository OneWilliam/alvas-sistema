import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { Cliente } from "../../domain/entities/Cliente";
import { idCliente } from "../../domain/value-objects/Ids";
import { ClienteNoEncontradoError } from "../../domain/errors/DomainErrors";
import { ErrorDeDominio } from "../../../shared/domain";

export type ObtenerClienteInput = {
  id: string;
};

export class ObtenerClienteUseCase implements CasoDeUso<ObtenerClienteInput, Resultado<Cliente, ErrorDeDominio>> {
  constructor(private readonly ventasRepository: IVentasRepository) {}

  async ejecutar(input: ObtenerClienteInput): Promise<Resultado<Cliente, ErrorDeDominio>> {
    try {
      const cliente = await this.ventasRepository.obtenerClientePorId(idCliente(input.id));

      if (!cliente) {
        return resultadoFallido(new ClienteNoEncontradoError(input.id));
      }

      return resultadoExitoso(cliente);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

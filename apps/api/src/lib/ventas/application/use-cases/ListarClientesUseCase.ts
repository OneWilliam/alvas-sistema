import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { Cliente } from "../../domain/entities/Cliente";
import { ErrorDeDominio } from "../../../shared/domain";

export type ListarClientesInput = void;

export type ListarClientesOutput = Cliente[];

export class ListarClientesUseCase implements CasoDeUso<ListarClientesInput, Resultado<ListarClientesOutput, ErrorDeDominio>> {
  constructor(private readonly ventasRepository: IVentasRepository) {}

  async ejecutar(): Promise<Resultado<ListarClientesOutput, ErrorDeDominio>> {
    try {
      const clientes = await this.ventasRepository.listarClientes();

      return resultadoExitoso(clientes);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

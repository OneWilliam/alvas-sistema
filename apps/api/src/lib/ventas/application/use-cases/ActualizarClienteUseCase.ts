import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { idCliente } from "../../domain/value-objects/Ids";
import { ClienteNoEncontradoError } from "../../domain/errors/DomainErrors";
import { type ActualizarClienteInputDTO, type ClienteOutputDTO } from "../dto/ClienteDTOs";

export type ActualizarClienteInput = ActualizarClienteInputDTO;
export type ActualizarClienteOutput = ClienteOutputDTO;

export class ActualizarClienteUseCase implements CasoDeUso<ActualizarClienteInput, Resultado<ActualizarClienteOutput, ErrorDeDominio>> {
  constructor(private readonly ventasRepository: IVentasRepository) {}

  async ejecutar(input: ActualizarClienteInput): Promise<Resultado<ActualizarClienteOutput, ErrorDeDominio>> {
    try {
      const cliente = await this.ventasRepository.obtenerClientePorId(idCliente(input.idCliente));
      if (!cliente) {
        return resultadoFallido(new ClienteNoEncontradoError(input.idCliente));
      }

      cliente.actualizarDatosContacto({
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
      });

      await this.ventasRepository.guardarCliente(cliente);

      const output: ClienteOutputDTO = {
        id: cliente.id as string,
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        idAsesor: cliente.idAsesor as string,
        creadoEn: cliente.creadoEn.toISOString(),
        actualizadoEn: cliente.actualizadoEn.toISOString(),
      };

      return resultadoExitoso(output);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

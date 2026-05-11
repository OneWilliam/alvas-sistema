import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type ActualizarClienteInputDTO, type ClienteOutputDTO } from "../../dto/ClienteDTOs";

export interface IActualizarCliente {
  ejecutar(
    input: ActualizarClienteInputDTO,
  ): Promise<Resultado<ClienteOutputDTO, ErrorDeDominio>>;
}

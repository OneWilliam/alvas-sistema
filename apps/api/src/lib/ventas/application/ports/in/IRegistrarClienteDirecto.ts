import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Cliente } from "../../../domain/entities/Cliente";
import { type RegistrarClienteDirectoInput } from "../../use-cases/RegistrarClienteDirectoUseCase";

export interface IRegistrarClienteDirecto {
  ejecutar(input: RegistrarClienteDirectoInput): Promise<Resultado<Cliente, ErrorDeDominio>>;
}

import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type CrearContratoInputDTO } from "../../dto/ContratoDTOs";
import { type ContratoOutputDTO } from "../../dto/ContratoDTOs";

export interface ICrearContrato {
  ejecutar(input: CrearContratoInputDTO): Promise<Resultado<ContratoOutputDTO, ErrorDeDominio>>;
}

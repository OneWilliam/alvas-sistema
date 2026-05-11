import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type ListarContratosOutputDTO } from "../../dto/ContratoDTOs";

export interface IListarContratos {
  ejecutar(): Promise<Resultado<ListarContratosOutputDTO, ErrorDeDominio>>;
}

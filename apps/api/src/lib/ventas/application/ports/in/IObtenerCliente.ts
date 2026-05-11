import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Cliente } from "../../../domain/entities/Cliente";

export type ObtenerClienteQuery = Readonly<{
  id: string;
}>;

export interface IObtenerCliente {
  ejecutar(input: ObtenerClienteQuery): Promise<Resultado<Cliente, ErrorDeDominio>>;
}

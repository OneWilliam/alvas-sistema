import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Lead } from "../../../domain/entities/Lead";

export type ListarLeadsQuery = Readonly<{
  idUsuarioEjecutor: string;
  rolEjecutor: string;
}>;

export interface IListarLeads {
  ejecutar(input: ListarLeadsQuery): Promise<Resultado<Lead[], ErrorDeDominio>>;
}

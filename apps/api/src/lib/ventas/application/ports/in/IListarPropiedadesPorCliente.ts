import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type IdPropiedad } from "../../../domain/value-objects/Ids";

export type ListarPropiedadesPorClienteQuery = Readonly<{
  idCliente: string;
}>;

export interface IListarPropiedadesPorCliente {
  ejecutar(input: ListarPropiedadesPorClienteQuery): Promise<Resultado<IdPropiedad[], ErrorDeDominio>>;
}

import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Lead } from "../../../domain/entities/Lead";

export type ListarLeadsPorAsesorQuery = Readonly<{
  idAsesor: string;
}>;

export interface IListarLeadsPorAsesor {
  ejecutar(input: ListarLeadsPorAsesorQuery): Promise<Resultado<Lead[], ErrorDeDominio>>;
}

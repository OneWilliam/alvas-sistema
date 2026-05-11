import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type IdUsuarioRef } from "../../../../shared/domain/value-objects/IdUsuarioRef";

export type AsesorConLeadsDTO = Readonly<{
  idAsesor: IdUsuarioRef;
  totalLeads: number;
}>;

export interface IListarAsesoresConLeads {
  ejecutar(): Promise<Resultado<AsesorConLeadsDTO[], ErrorDeDominio>>;
}

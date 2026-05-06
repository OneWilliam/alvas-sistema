import { type Marca } from "../../../shared/domain/types/Marca";

export type IdLead = Marca<string, "IdLead">;
export const idLead = (valor: string): IdLead => valor as IdLead;

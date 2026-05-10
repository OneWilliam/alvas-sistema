import { type Marca } from "../../../shared/domain/types/Marca";

export type IdLead = Marca<string, "IdLead">;
export const idLead = (valor: string): IdLead => valor as IdLead;

export type IdCita = Marca<string, "IdCita">;
export const idCita = (valor: string): IdCita => valor as IdCita;

export type IdCliente = Marca<string, "IdCliente">;
export const idCliente = (valor: string): IdCliente => valor as IdCliente;

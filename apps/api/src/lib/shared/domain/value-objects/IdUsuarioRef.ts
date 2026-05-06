import { type Marca } from "../types/Marca";

export type IdUsuarioRef = Marca<string, "IdUsuarioRef">;
export const idUsuarioRef = (valor: string): IdUsuarioRef => valor as IdUsuarioRef;

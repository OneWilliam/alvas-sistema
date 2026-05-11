import { type Marca } from "../../../shared/domain/types/Marca";

export type IdPropiedad = Marca<string, "IdPropiedad">;
export const idPropiedad = (valor: string): IdPropiedad => valor as IdPropiedad;

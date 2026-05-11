import { type Resultado } from "../../../shared";
import { type ErrorDeDominio } from "../../../shared/domain";

export type RegistroLeadCaptacionInput = Readonly<{
  nombre: string;
  email: string;
  telefono: string;
  tipo: string;
  idAsesor?: string;
  idPropiedadInteres?: string;
}>;

export interface IRegistroLeadCaptacion {
  registrar(input: RegistroLeadCaptacionInput): Promise<Resultado<{ id: string }, ErrorDeDominio>>;
}

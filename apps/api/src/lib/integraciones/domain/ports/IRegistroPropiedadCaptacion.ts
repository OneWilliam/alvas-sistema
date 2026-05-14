import { type Resultado } from "../../../shared";
import { type ErrorDeDominio } from "../../../shared/domain";

export type RegistroPropiedadCaptacionInput = Readonly<{
  idLeadOrigen: string;
  asesorCaptadorId: string;
  nombreContacto: string;
  origen: string;
  metadata?: Readonly<Record<string, string>>;
}>;

export interface IRegistroPropiedadCaptacion {
  registrar(
    input: RegistroPropiedadCaptacionInput,
  ): Promise<Resultado<{ id: string }, ErrorDeDominio>>;
}

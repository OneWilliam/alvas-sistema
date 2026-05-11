import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";

export type FirmarContratoCommand = Readonly<{
  idContrato: string;
}>;

export interface IFirmarContrato {
  ejecutar(input: FirmarContratoCommand): Promise<Resultado<void, ErrorDeDominio>>;
}

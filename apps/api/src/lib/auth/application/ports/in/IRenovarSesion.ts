import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Resultado } from "../../../../shared";
import { type SesionAutenticadaDTO } from "../../dto";

export type RenovarSesionCommand = Readonly<{
  refreshToken: string;
}>;

export interface IRenovarSesion {
  ejecutar(
    input: RenovarSesionCommand,
  ): Promise<Resultado<SesionAutenticadaDTO, ErrorDeDominio>>;
}

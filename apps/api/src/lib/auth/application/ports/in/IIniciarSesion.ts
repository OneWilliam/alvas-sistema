import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Resultado } from "../../../../shared";
import { type SesionAutenticadaDTO } from "../../dto";

export type IniciarSesionCommand = Readonly<{
  username: string;
  clave: string;
}>;

export interface IIniciarSesion {
  ejecutar(
    input: IniciarSesionCommand,
  ): Promise<Resultado<SesionAutenticadaDTO, ErrorDeDominio>>;
}

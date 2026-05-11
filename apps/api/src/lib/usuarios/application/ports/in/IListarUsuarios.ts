import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type UsuarioListadoOutputDTO } from "../../dto/UsuarioListadoDTOs";

export interface IListarUsuarios {
  ejecutar(): Promise<Resultado<UsuarioListadoOutputDTO[], ErrorDeDominio>>;
}

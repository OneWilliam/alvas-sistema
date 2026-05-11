import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import {
  type ActualizarUsuarioInputDTO,
  type UsuarioOutputDTO,
} from "../../dto/UsuarioActualizacionDTOs";

export interface IActualizarUsuario {
  ejecutar(
    input: ActualizarUsuarioInputDTO,
  ): Promise<Resultado<UsuarioOutputDTO, ErrorDeDominio>>;
}

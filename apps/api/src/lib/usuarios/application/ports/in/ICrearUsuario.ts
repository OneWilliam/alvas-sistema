import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type CrearUsuarioDTO } from "../../dto/UsuarioDTOs";
import { type Usuario } from "../../../domain/entities";

export interface ICrearUsuario {
  ejecutar(dto: CrearUsuarioDTO): Promise<Resultado<Usuario, ErrorDeDominio>>;
}

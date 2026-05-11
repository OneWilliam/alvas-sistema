import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IUsuarioRepository } from "../../domain/ports/IUsuarioRepository";
import { type UsuarioListadoOutputDTO } from "../dto/UsuarioListadoDTOs";

export type ListarUsuariosInput = void;
export type ListarUsuariosOutput = UsuarioListadoOutputDTO[];

export class ListarUsuariosUseCase implements CasoDeUso<
  ListarUsuariosInput,
  Resultado<ListarUsuariosOutput, ErrorDeDominio>
> {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async ejecutar(): Promise<Resultado<ListarUsuariosOutput, ErrorDeDominio>> {
    try {
      const usuarios = await this.usuarioRepository.listar();

      const output: UsuarioListadoOutputDTO[] = usuarios.map((usuario) => ({
        id: usuario.id.valor,
        username: usuario.username.valor,
        nombre: usuario.nombre.valor,
        rol: usuario.rol.valor,
        estado: usuario.estado.valor,
        creadoEn: usuario.creadoEn.toISOString(),
        actualizadoEn: usuario.actualizadoEn.toISOString(),
      }));

      return resultadoExitoso(output);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

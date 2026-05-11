import type { CasoDeUso } from "../../../shared/application/CasoDeUso";
import { resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { type IUsuarioRepository } from "../../../usuarios/domain/ports/IUsuarioRepository";
import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";
import { ErrorDeDominio as UsuarioErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";
import { type Usuario } from "../../../usuarios/domain/entities/Usuario";

export type ObtenerUsuarioPorEmailInput = {
  email: string;
};

export type ObtenerUsuarioPorEmailOutput = Usuario | null;

export class ObtenerUsuarioPorEmailUseCase implements CasoDeUso<ObtenerUsuarioPorEmailInput, Resultado<ObtenerUsuarioPorEmailOutput, ErrorDeDominio>> {
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async ejecutar(input: ObtenerUsuarioPorEmailInput): Promise<Resultado<ObtenerUsuarioPorEmailOutput, ErrorDeDominio>> {
    try {
      const usuarios = await this.usuarioRepository.listar();

      const usuario = usuarios.find(u => u.nombre.valor.toLowerCase() === input.email.toLowerCase());

      if (!usuario) {
        return resultadoFallido(new UsuarioErrorDeDominio("Usuario no encontrado"));
      }

      return resultadoExitoso(usuario);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

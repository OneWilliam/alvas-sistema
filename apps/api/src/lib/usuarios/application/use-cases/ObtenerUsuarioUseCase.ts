import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";
import { type IUsuarioRepository } from "../../domain/ports/IUsuarioRepository";
import { IdUsuario } from "../../domain/value-objects";
import { UsuarioNoEncontradoError } from "../../domain/errors/UsuarioNoEncontradoError";
import { type UsuarioOutputDTO } from "../dto/UsuarioActualizacionDTOs";
import { type IObtenerUsuario } from "../ports/in";

export type ObtenerUsuarioInput = {
  idUsuario: string;
};
export type ObtenerUsuarioOutput = UsuarioOutputDTO;

export class ObtenerUsuarioUseCase implements CasoDeUso<
  ObtenerUsuarioInput,
  Resultado<ObtenerUsuarioOutput, ErrorDeDominio>
>,
  IObtenerUsuario
{
  constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  async ejecutar(
    input: ObtenerUsuarioInput,
  ): Promise<Resultado<ObtenerUsuarioOutput, ErrorDeDominio>> {
    try {
      const usuario = await this.usuarioRepository.obtenerPorId(new IdUsuario(input.idUsuario));
      if (!usuario) {
        return resultadoFallido(new UsuarioNoEncontradoError(undefined, input.idUsuario));
      }

      const output: UsuarioOutputDTO = {
        id: usuario.id.valor,
        username: usuario.username.valor,
        nombre: usuario.nombre.valor,
        rol: usuario.rol.valor,
        estado: usuario.estado.valor,
        creadoEn: usuario.creadoEn.toISOString(),
        actualizadoEn: usuario.actualizadoEn.toISOString(),
      };

      return resultadoExitoso(output);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

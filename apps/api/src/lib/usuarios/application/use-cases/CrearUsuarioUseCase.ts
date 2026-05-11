import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IPasswordHasher, type IUsuarioRepository } from "../../domain/ports";
import { Usuario } from "../../domain/entities";
import { IdUsuario, Username } from "../../domain/value-objects";
import { UsuarioYaExisteError } from "../../domain/errors";
import { type CrearUsuarioDTO } from "../dto/UsuarioDTOs";
import { type ICrearUsuario } from "../ports/in";

export class CrearUsuarioUseCase implements CasoDeUso<
  CrearUsuarioDTO,
  Resultado<Usuario, ErrorDeDominio>
>,
  ICrearUsuario
{
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async ejecutar(dto: CrearUsuarioDTO): Promise<Resultado<Usuario, ErrorDeDominio>> {
    try {
      const idUsuario = new IdUsuario(dto.idUsuario);
      const username = new Username(dto.username);

      if (
        (await this.usuarioRepository.existePorId(idUsuario)) ||
        (await this.usuarioRepository.existePorUsername(username))
      ) {
        return resultadoFallido(new UsuarioYaExisteError(username.valor));
      }

      const hashClave = await this.passwordHasher.hashear(dto.clave);

      const usuario = Usuario.crear({
        id: idUsuario.valor,
        username: username.valor,
        nombre: dto.nombre,
        hashClave: hashClave.valor,
        rol: dto.rol,
      });

      await this.usuarioRepository.guardar(usuario);

      return resultadoExitoso(usuario);
    } catch (error) {
      if (error instanceof ErrorDeDominio) {
        return resultadoFallido(error);
      }

      throw error;
    }
  }
}

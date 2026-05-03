import { type IPasswordHasher, type IUsuarioRepository } from "../../domain/ports";
import { Usuario } from "../../domain/entities";
import { IdUsuario } from "../../domain/value-objects";
import { UsuarioYaExisteError } from "../../domain/errors";
import { type CrearUsuarioDTO, type UsuarioRespuestaDTO } from "../dto/UsuarioDTOs";

export class CrearUsuarioUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async ejecutar(dto: CrearUsuarioDTO): Promise<UsuarioRespuestaDTO> {
    const idUsuario = new IdUsuario(dto.idUsuario);

    if (await this.usuarioRepository.existePorId(idUsuario)) {
      throw new UsuarioYaExisteError(idUsuario.valor);
    }

    const hashClave = await this.passwordHasher.hashear(dto.clave);

    const usuario = Usuario.crear({
      id: idUsuario.valor,
      hashClave,
      rol: dto.rol,
    });

    await this.usuarioRepository.guardar(usuario);

    return {
      id: usuario.id.valor,
      rol: usuario.rol.valor,
      estado: usuario.estado.valor,
    };
  }
}

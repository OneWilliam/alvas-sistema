import { type CasoDeUso } from "../../../shared";
import { IdUsuario, type IPasswordHasher, type IUsuarioRepository } from "../../../usuarios";
import { CredencialesInvalidasError, type ITokenProvider } from "../../domain";
import { type SesionAutenticadaDTO } from "../dto";

export type IniciarSesionInput = {
  idUsuario: string;
  clave: string;
};

export class IniciarSesionUseCase implements CasoDeUso<IniciarSesionInput, SesionAutenticadaDTO> {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async ejecutar(input: IniciarSesionInput): Promise<SesionAutenticadaDTO> {
    const idUsuario = new IdUsuario(input.idUsuario);
    const clave = input.clave.trim();

    if (!clave) {
      throw new CredencialesInvalidasError();
    }

    const usuario = await this.usuarioRepository.obtenerPorId(idUsuario);

    if (!usuario || usuario.estado.estaDeshabilitado()) {
      throw new CredencialesInvalidasError();
    }

    const coincideClave = await this.passwordHasher.comparar(clave, usuario.hashClave);

    if (!coincideClave) {
      throw new CredencialesInvalidasError();
    }

    const payload = {
      idUsuario: usuario.id.valor,
      rol: usuario.rol.valor,
    };
    const authToken = await this.tokenProvider.generarAuthToken(payload);
    const refreshToken = await this.tokenProvider.generarRefreshToken(payload);

    return {
      authToken: authToken.valor,
      refreshToken: refreshToken.valor,
      usuario: {
        id: payload.idUsuario,
        rol: payload.rol,
      },
    };
  }
}

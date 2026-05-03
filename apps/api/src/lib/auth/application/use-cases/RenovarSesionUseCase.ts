import { type CasoDeUso } from "../../../shared";
import { IdUsuario, type IUsuarioRepository } from "../../../usuarios";
import { CredencialesInvalidasError, RefreshToken, type ITokenProvider } from "../../domain";
import { type SesionAutenticadaDTO } from "../dto";

export type RenovarSesionInput = {
  refreshToken: string;
};

export class RenovarSesionUseCase implements CasoDeUso<RenovarSesionInput, SesionAutenticadaDTO> {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async ejecutar(input: RenovarSesionInput): Promise<SesionAutenticadaDTO> {
    const refreshToken = new RefreshToken(input.refreshToken);
    const payloadRefresh = await this.tokenProvider.validarRefreshToken(refreshToken);
    const usuario = await this.usuarioRepository.obtenerPorId(new IdUsuario(payloadRefresh.idUsuario));

    if (!usuario || usuario.estado.estaDeshabilitado()) {
      throw new CredencialesInvalidasError();
    }

    const payload = {
      idUsuario: usuario.id.valor,
      rol: usuario.rol.valor,
    };
    const authToken = await this.tokenProvider.generarAuthToken(payload);
    const nuevoRefreshToken = await this.tokenProvider.generarRefreshToken(payload);

    return {
      authToken: authToken.valor,
      refreshToken: nuevoRefreshToken.valor,
      usuario: {
        id: payload.idUsuario,
        rol: payload.rol,
      },
    };
  }
}

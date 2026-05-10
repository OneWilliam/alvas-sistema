import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { CredencialesInvalidasError, RefreshToken } from "../../domain";
import { type SesionAutenticadaDTO } from "../dto";
import { type IAutenticadorDeUsuario, type ITokenProvider } from "../../domain/ports";

export type RenovarSesionInput = {
  refreshToken: string;
};

export class RenovarSesionUseCase
  implements CasoDeUso<RenovarSesionInput, Resultado<SesionAutenticadaDTO, ErrorDeDominio>>
{
  constructor(
    private readonly autenticador: IAutenticadorDeUsuario,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async ejecutar(input: RenovarSesionInput): Promise<Resultado<SesionAutenticadaDTO, ErrorDeDominio>> {
    try {
      const refreshToken = new RefreshToken(input.refreshToken);
      const payloadRefresh = await this.tokenProvider.validarRefreshToken(refreshToken);
      const usuario = await this.autenticador.buscarPorId(payloadRefresh.idUsuario);

      if (!usuario || usuario.estaDeshabilitado) {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const payload = {
        idUsuario: payloadRefresh.idUsuario,
        rol: usuario.rol,
      };
      const authToken = await this.tokenProvider.generarAuthToken(payload);
      const nuevoRefreshToken = await this.tokenProvider.generarRefreshToken(payload);

      return resultadoExitoso({
        authToken: authToken.valor,
        refreshToken: nuevoRefreshToken.valor,
        usuario: {
          id: payload.idUsuario,
          rol: payload.rol,
        },
      });
    } catch (error) {
      if (error instanceof ErrorDeDominio) {
        return resultadoFallido(error);
      }

      throw error;
    }
  }
}


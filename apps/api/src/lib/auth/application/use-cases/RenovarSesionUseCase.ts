import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { CredencialesInvalidasError, RefreshToken, Sesion } from "../../domain";
import { type SesionAutenticadaDTO } from "../dto";
import { type IConsultaCredencialesUsuario, type ITokenProvider } from "../../domain/ports";

export type RenovarSesionInput = {
  refreshToken: string;
};

export class RenovarSesionUseCase implements CasoDeUso<
  RenovarSesionInput,
  Resultado<SesionAutenticadaDTO, ErrorDeDominio>
> {
  constructor(
    private readonly consultaCredenciales: IConsultaCredencialesUsuario,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async ejecutar(
    input: RenovarSesionInput,
  ): Promise<Resultado<SesionAutenticadaDTO, ErrorDeDominio>> {
    try {
      const refreshToken = new RefreshToken(input.refreshToken);
      const payloadRefresh = await this.tokenProvider.validarRefreshToken(refreshToken);
      const usuario = await this.consultaCredenciales.buscarPorId(payloadRefresh.idUsuario);

      if (!usuario || usuario.estado !== "ACTIVO") {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const payload = {
        idUsuario: payloadRefresh.idUsuario,
        rol: usuario.rol,
      };
      const authToken = await this.tokenProvider.generarAuthToken(payload);
      const nuevoRefreshToken = await this.tokenProvider.generarRefreshToken(payload);
      const sesion = Sesion.abrir({
        authToken: authToken.valor,
        refreshToken: nuevoRefreshToken.valor,
        idUsuario: usuario.idUsuario,
        username: usuario.username,
        rol: usuario.rol,
      });

      return resultadoExitoso({
        authToken: sesion.authToken,
        refreshToken: sesion.refreshToken,
        usuario: {
          id: sesion.idUsuario,
          username: sesion.username,
          rol: sesion.rol,
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

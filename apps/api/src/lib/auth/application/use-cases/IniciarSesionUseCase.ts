import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { CredencialesInvalidasError, Sesion } from "../../domain";
import { type SesionAutenticadaDTO } from "../dto";
import {
  type IConsultaCredencialesUsuario,
  type ITokenProvider,
  type IVerificadorDeClave,
} from "../../domain/ports";

export type IniciarSesionInput = {
  username: string;
  clave: string;
};

export class IniciarSesionUseCase implements CasoDeUso<
  IniciarSesionInput,
  Resultado<SesionAutenticadaDTO, ErrorDeDominio>
> {
  constructor(
    private readonly consultaCredenciales: IConsultaCredencialesUsuario,
    private readonly verificadorDeClave: IVerificadorDeClave,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async ejecutar(
    input: IniciarSesionInput,
  ): Promise<Resultado<SesionAutenticadaDTO, ErrorDeDominio>> {
    try {
      const clave = input.clave.trim();

      if (!clave) {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const username = input.username.trim().toLowerCase();
      const usuario = await this.consultaCredenciales.buscarPorUsername(username);

      if (!usuario || usuario.estado !== "ACTIVO") {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const coincideClave = await this.verificadorDeClave.comparar(clave, usuario.hashClave);

      if (!coincideClave) {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const payload = {
        idUsuario: usuario.idUsuario,
        rol: usuario.rol,
      };
      const authToken = await this.tokenProvider.generarAuthToken(payload);
      const refreshToken = await this.tokenProvider.generarRefreshToken(payload);
      const sesion = Sesion.abrir({
        authToken: authToken.valor,
        refreshToken: refreshToken.valor,
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

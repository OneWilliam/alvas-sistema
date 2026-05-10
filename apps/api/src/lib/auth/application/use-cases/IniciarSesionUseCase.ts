import { type CasoDeUso, resultadoExitoso, resultadoFallido, type Resultado } from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { CredencialesInvalidasError } from "../../domain";
import { type SesionAutenticadaDTO } from "../dto";
import { type IAutenticadorDeUsuario, type ITokenProvider, type IVerificadorDeClave } from "../../domain/ports";

export type IniciarSesionInput = {
  idUsuario: string;
  clave: string;
};

export class IniciarSesionUseCase
  implements CasoDeUso<IniciarSesionInput, Resultado<SesionAutenticadaDTO, ErrorDeDominio>>
{
  constructor(
    private readonly autenticador: IAutenticadorDeUsuario,
    private readonly verificadorDeClave: IVerificadorDeClave,
    private readonly tokenProvider: ITokenProvider,
  ) {}

  async ejecutar(input: IniciarSesionInput): Promise<Resultado<SesionAutenticadaDTO, ErrorDeDominio>> {
    try {
      const clave = input.clave.trim();

      if (!clave) {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const usuario = await this.autenticador.buscarPorId(input.idUsuario);

      if (!usuario || usuario.estaDeshabilitado) {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const coincideClave = await this.verificadorDeClave.comparar(clave, usuario.hashClave);

      if (!coincideClave) {
        return resultadoFallido(new CredencialesInvalidasError());
      }

      const payload = {
        idUsuario: input.idUsuario,
        rol: usuario.rol,
      };
      const authToken = await this.tokenProvider.generarAuthToken(payload);
      const refreshToken = await this.tokenProvider.generarRefreshToken(payload);

      return resultadoExitoso({
        authToken: authToken.valor,
        refreshToken: refreshToken.valor,
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

import { type Context } from "hono";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { IniciarSesionUseCase } from "../../application/use-cases/IniciarSesionUseCase";
import { RenovarSesionUseCase } from "../../application/use-cases/RenovarSesionUseCase";
import { type IConsultaCredencialesUsuario, type IVerificadorDeClave } from "../../domain/ports";
import { type ITokenProvider } from "../../domain/ports/ITokenProvider";
import { type IniciarSesionInput } from "../../application/use-cases/IniciarSesionUseCase";

export type BindingsAuth = {
  DB: D1DatabaseLike;
  AUTH_SECRET: string;
  AUTH_REFRESH_SECRET?: string;
  AUTH_TOKEN_TTL_SEGUNDOS?: string;
  REFRESH_TOKEN_TTL_SEGUNDOS?: string;
  AUTH_PEPPER?: string;
};

export type AuthControllerDeps = Readonly<{
  crearConsultaCredenciales: (db: D1DatabaseLike) => IConsultaCredencialesUsuario;
  crearVerificadorDeClave: (pepper?: string) => IVerificadorDeClave;
  crearTokenProvider: (env: BindingsAuth) => ITokenProvider;
}>;

type ContextoAuth = Context<{ Bindings: BindingsAuth }>;

export class AuthController {
  constructor(private readonly deps: AuthControllerDeps) {}

  async iniciarSesion(c: ContextoAuth): Promise<Response> {
    try {
      const body = await c.req.json<IniciarSesionInput>();
      const consultaCredenciales = this.deps.crearConsultaCredenciales(c.env.DB);
      const verificadorDeClave = this.deps.crearVerificadorDeClave(c.env.AUTH_PEPPER);
      const tokenProvider = this.deps.crearTokenProvider(c.env);

      const useCase = new IniciarSesionUseCase(
        consultaCredenciales,
        verificadorDeClave,
        tokenProvider,
      );
      const resultado = await useCase.ejecutar(body);

      if (!resultado.esExito) {
        return c.json(
          {
            success: false,
            message: resultado.error.message,
            code: resultado.error.codigo,
          },
          401,
        );
      }

      return c.json({
        success: true,
        data: resultado.valor,
      });
    } catch (error) {
      console.error("Error inesperado en AuthController.iniciarSesion:", error);
      return c.json(
        {
          success: false,
          message: "Error interno del servidor",
        },
        500,
      );
    }
  }

  async renovarSesion(c: ContextoAuth): Promise<Response> {
    try {
      const { refreshToken } = await c.req.json<{ refreshToken: string }>();
      const consultaCredenciales = this.deps.crearConsultaCredenciales(c.env.DB);
      const tokenProvider = this.deps.crearTokenProvider(c.env);

      const useCase = new RenovarSesionUseCase(consultaCredenciales, tokenProvider);
      const resultado = await useCase.ejecutar({ refreshToken });

      if (!resultado.esExito) {
        return c.json(
          {
            success: false,
            message: resultado.error.message,
            code: resultado.error.codigo,
          },
          401,
        );
      }

      return c.json({
        success: true,
        data: resultado.valor,
      });
    } catch (error) {
      console.error("Error inesperado en AuthController.renovarSesion:", error);
      return c.json(
        {
          success: false,
          message: "Error interno del servidor",
        },
        500,
      );
    }
  }
}

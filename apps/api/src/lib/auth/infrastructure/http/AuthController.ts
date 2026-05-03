import { type Context } from "hono";
import { type PayloadToken } from "../../application";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { D1UsuarioRepository } from "../../../usuarios/infrastructure";
import { IniciarSesionUseCase, RenovarSesionUseCase } from "../../application";
import { AuthTokenInvalidoError, CredencialesInvalidasError } from "../../domain";
import { crearTokenProviderDesdeEnv } from "../security/TokenProviderFactory";
import { Pbkdf2PasswordHasher } from "../../../usuarios/infrastructure";

export type AuthBindings = {
  DB: D1DatabaseLike;
  AUTH_SECRET: string;
  AUTH_REFRESH_SECRET?: string;
  AUTH_TOKEN_TTL_SEGUNDOS?: string;
  REFRESH_TOKEN_TTL_SEGUNDOS?: string;
  AUTH_PEPPER?: string;
};

export type AuthVariables = {
  authPayload: PayloadToken;
};

type ContextoAuth = Context<{ Bindings: AuthBindings; Variables: AuthVariables }>;

export class AuthController {
  async login(c: ContextoAuth): Promise<Response> {
    const body = await c.req.json<{ idUsuario: string; clave: string }>();
    const usuarioRepository = new D1UsuarioRepository(c.env.DB);
    const passwordHasher = new Pbkdf2PasswordHasher(c.env.AUTH_PEPPER);
    const tokenProvider = crearTokenProviderDesdeEnv(c.env);
    const useCase = new IniciarSesionUseCase(usuarioRepository, passwordHasher, tokenProvider);
    const sesion = await useCase.ejecutar({
      idUsuario: body.idUsuario,
      clave: body.clave,
    });

    if (!sesion.esExito) {
      return this.responderErrorDeDominio(sesion.error, c);
    }

    return c.json({ success: true, data: sesion.valor }, 200);
  }

  async refresh(c: ContextoAuth): Promise<Response> {
    const body = await c.req.json<{ refreshToken: string }>();
    const usuarioRepository = new D1UsuarioRepository(c.env.DB);
    const tokenProvider = crearTokenProviderDesdeEnv(c.env);
    const useCase = new RenovarSesionUseCase(usuarioRepository, tokenProvider);
    const sesion = await useCase.ejecutar({
      refreshToken: body.refreshToken,
    });

    if (!sesion.esExito) {
      return this.responderErrorDeDominio(sesion.error, c);
    }

    return c.json({ success: true, data: sesion.valor }, 200);
  }

  async me(c: ContextoAuth): Promise<Response> {
    return c.json({
      success: true,
      data: c.get("authPayload"),
    });
  }

  private responderErrorDeDominio(error: ErrorDeDominio, c: ContextoAuth): Response {
    if (error instanceof CredencialesInvalidasError || error instanceof AuthTokenInvalidoError) {
      return c.json({ success: false, message: error.message, code: error.codigo }, 401);
    }

    return c.json({ success: false, message: error.message, code: error.codigo }, 400);
  }
}

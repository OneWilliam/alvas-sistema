import { IniciarSesionUseCase, RenovarSesionUseCase } from "../lib/auth/application";
import { type AuthControllerDeps } from "../lib/auth/infrastructure";
import { crearTokenProviderDesdeEnv } from "../lib/auth/infrastructure/security/TokenProviderFactory";
import {
  ConsultaCredencialesUsuarioAdapter,
  D1UsuarioRepository,
  VerificadorDeClavePbkdf2Adapter,
} from "../lib/usuarios/infrastructure";

export function crearAuthControllerDeps(): AuthControllerDeps {
  return {
    crearIniciarSesion: (c) =>
      new IniciarSesionUseCase(
        new ConsultaCredencialesUsuarioAdapter(new D1UsuarioRepository(c.env.DB)),
        new VerificadorDeClavePbkdf2Adapter(c.env.AUTH_PEPPER),
        crearTokenProviderDesdeEnv(c.env),
      ),
    crearRenovarSesion: (c) =>
      new RenovarSesionUseCase(
        new ConsultaCredencialesUsuarioAdapter(new D1UsuarioRepository(c.env.DB)),
        crearTokenProviderDesdeEnv(c.env),
      ),
  };
}

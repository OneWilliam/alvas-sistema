import {
  ActualizarUsuarioUseCase,
  CrearUsuarioUseCase,
  ListarUsuariosUseCase,
  ObtenerUsuarioUseCase,
} from "../lib/usuarios/application";
import {
  type UsuarioControllerDeps,
} from "../lib/usuarios/infrastructure";
import { D1UsuarioRepository } from "../lib/usuarios/infrastructure";
import { Pbkdf2PasswordHasher } from "../lib/usuarios/infrastructure/security/Pbkdf2PasswordHasher";

export function crearUsuarioControllerDeps(): UsuarioControllerDeps {
  return {
    crearCrearUsuario: (c) =>
      new CrearUsuarioUseCase(
        new D1UsuarioRepository(c.env.DB),
        new Pbkdf2PasswordHasher(c.env.AUTH_PEPPER),
      ),
    crearListarUsuarios: (c) => new ListarUsuariosUseCase(new D1UsuarioRepository(c.env.DB)),
    crearObtenerUsuario: (c) => new ObtenerUsuarioUseCase(new D1UsuarioRepository(c.env.DB)),
    crearActualizarUsuario: (c) =>
      new ActualizarUsuarioUseCase(new D1UsuarioRepository(c.env.DB)),
  };
}

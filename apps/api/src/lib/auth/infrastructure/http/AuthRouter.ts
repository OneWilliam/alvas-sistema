import { Hono } from "hono";
import { D1UsuarioRepository } from "../../../usuarios/infrastructure/persistence/D1UsuarioRepository";
import {
  ConsultaCredencialesUsuarioAdapter,
  VerificadorDeClavePbkdf2Adapter,
} from "../../../usuarios/infrastructure";
import { crearTokenProviderDesdeEnv } from "../security/TokenProviderFactory";
import { AuthController, type AuthControllerDeps, type BindingsAuth } from "./AuthController";

export function crearAuthRouter() {
  const deps: AuthControllerDeps = {
    crearConsultaCredenciales: (db) =>
      new ConsultaCredencialesUsuarioAdapter(new D1UsuarioRepository(db)),
    crearVerificadorDeClave: (pepper) => new VerificadorDeClavePbkdf2Adapter(pepper),
    crearTokenProvider: (env: BindingsAuth) => crearTokenProviderDesdeEnv(env),
  };

  const router = new Hono<{ Bindings: BindingsAuth }>();
  const controller = new AuthController(deps);

  router.post("/login", (c) => controller.iniciarSesion(c));
  router.post("/refresh", (c) => controller.renovarSesion(c));

  return router;
}

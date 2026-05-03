import { Hono } from "hono";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { UsuarioYaExisteError } from "../../domain";
import { CrearUsuarioUseCase } from "../../application";
import { D1UsuarioRepository } from "../persistence/D1UsuarioRepository";
import { Pbkdf2PasswordHasher } from "../security/Pbkdf2PasswordHasher";

type BindingsUsuarios = {
  DB: D1DatabaseLike;
  AUTH_PEPPER?: string;
};

export const crearUsuarioController = () => {
  const router = new Hono<{ Bindings: BindingsUsuarios }>();

  router.post("/", async (c) => {
    try {
      const body = await c.req.json();
      const repo = new D1UsuarioRepository(c.env.DB);
      const passwordHasher = new Pbkdf2PasswordHasher(c.env.AUTH_PEPPER);
      
      const useCase = new CrearUsuarioUseCase(repo, passwordHasher);
      const resultado = await useCase.ejecutar({
        idUsuario: body.idUsuario,
        clave: body.clave,
        rol: body.rol,
      });

      return c.json(
        {
          success: true,
          data: resultado,
        },
        201,
      );
    } catch (error) {
      if (error instanceof UsuarioYaExisteError) {
        return c.json({ success: false, message: error.message, code: error.codigo }, 409);
      }

      if (error instanceof ErrorDeDominio) {
        return c.json({ success: false, message: error.message, code: error.codigo }, 400);
      }

      return c.json({ success: false, message: "Error interno al crear usuario." }, 500);
    }
  });

  return router;
};

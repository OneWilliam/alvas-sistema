import { type Context } from "hono";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import {
  type IActualizarUsuario,
  type ICrearUsuario,
  type IListarUsuarios,
  type IObtenerUsuario,
} from "../../application";
import { UsuarioMapper } from "../persistence/UsuarioMapper";
import { type CrearUsuarioDTO } from "../../application/dto/UsuarioDTOs";
import { type ActualizarUsuarioBodyDTO } from "../../application/dto/UsuarioRequestDTOs";

export type BindingsUsuarios = {
  DB: D1DatabaseLike;
  AUTH_PEPPER?: string;
};

type ContextoUsuarios = Context<{ Bindings: BindingsUsuarios }>;

export type UsuarioControllerDeps = Readonly<{
  crearCrearUsuario: (c: ContextoUsuarios) => ICrearUsuario;
  crearListarUsuarios: (c: ContextoUsuarios) => IListarUsuarios;
  crearObtenerUsuario: (c: ContextoUsuarios) => IObtenerUsuario;
  crearActualizarUsuario: (c: ContextoUsuarios) => IActualizarUsuario;
}>;

export class UsuarioController {
  constructor(private readonly deps: UsuarioControllerDeps) {}

  async crear(c: ContextoUsuarios): Promise<Response> {
    try {
      const body = await c.req.json<CrearUsuarioDTO>();
      const useCase = this.deps.crearCrearUsuario(c);
      const resultado = await useCase.ejecutar({
        idUsuario: body.idUsuario,
        username: body.username,
        nombre: body.nombre,
        clave: body.clave,
        rol: body.rol,
      });

      if (!resultado.esExito) {
        return this.responderErrorDeDominio(resultado.error, c);
      }

      return c.json(
        {
          success: true,
          data: UsuarioMapper.aRespuesta(resultado.valor),
        },
        201,
      );
    } catch (error) {
      console.error("Error inesperado en UsuarioController.crear:", error);
      return c.json(
        {
          success: false,
          message: "Error interno del servidor",
          error: error instanceof Error ? error.message : String(error),
        },
        500,
      );
    }
  }

  async listar(c: ContextoUsuarios): Promise<Response> {
    try {
      const useCase = this.deps.crearListarUsuarios(c);
      const resultado = await useCase.ejecutar();

      if (!resultado.esExito) {
        return this.responderErrorDeDominio(resultado.error, c);
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      console.error("Error inesperado en UsuarioController.listar:", error);
      return c.json({ success: false, message: "Error interno del servidor" }, 500);
    }
  }

  async obtener(c: ContextoUsuarios): Promise<Response> {
    try {
      const useCase = this.deps.crearObtenerUsuario(c);
      const resultado = await useCase.ejecutar({ idUsuario: c.req.param("idUsuario") ?? "" });

      if (!resultado.esExito) {
        return this.responderErrorDeDominio(resultado.error, c);
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      console.error("Error inesperado en UsuarioController.obtener:", error);
      return c.json({ success: false, message: "Error interno del servidor" }, 500);
    }
  }

  async actualizar(c: ContextoUsuarios): Promise<Response> {
    try {
      const useCase = this.deps.crearActualizarUsuario(c);
      const body = await c.req.json<ActualizarUsuarioBodyDTO>();
      const resultado = await useCase.ejecutar({
        idUsuario: c.req.param("idUsuario") ?? "",
        username: body.username,
        nombre: body.nombre,
        rol: body.rol,
      });

      if (!resultado.esExito) {
        return this.responderErrorDeDominio(resultado.error, c);
      }

      return c.json({ success: true, data: resultado.valor });
    } catch (error) {
      console.error("Error inesperado en UsuarioController.actualizar:", error);
      return c.json({ success: false, message: "Error interno del servidor" }, 500);
    }
  }

  private responderErrorDeDominio(error: ErrorDeDominio, c: ContextoUsuarios): Response {
    return c.json({ success: false, message: error.message, code: error.codigo }, 400);
  }
}

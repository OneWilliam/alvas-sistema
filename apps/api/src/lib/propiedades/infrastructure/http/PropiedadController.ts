import { type Context } from "hono";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike, type SessionClaims } from "../../../shared/infrastructure";
import {
  type CrearPropiedadDTO,
  type ICrearPropiedad,
  type IListarPropiedades,
  type PropiedadRespuestaDTO,
} from "../../application";
import { type IAutorizadorPropiedades } from "../../domain/ports";

export type BindingsPropiedades = {
  DB: D1DatabaseLike;
};

type AppVariables = {
  authPayload: SessionClaims;
};

type ContextoPropiedades = Context<{ Bindings: BindingsPropiedades; Variables: AppVariables }>;

export type PropiedadControllerDeps = Readonly<{
  crearCrearPropiedad: (c: ContextoPropiedades) => ICrearPropiedad;
  crearListarPropiedades: (c: ContextoPropiedades) => IListarPropiedades;
}>;

export class PropiedadController {
  constructor(
    private readonly autorizador: IAutorizadorPropiedades,
    private readonly deps: PropiedadControllerDeps,
  ) {}

  async crear(c: ContextoPropiedades): Promise<Response> {
    try {
      const body = await c.req.json<CrearPropiedadDTO>();
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearCrearPropiedad(c);

      const resultado = await useCase.ejecutar({
        ...body,
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        const err = resultado.error as ErrorDeDominio;
        return c.json({ success: false, message: err.message, code: err.codigo }, 403);
      }

      return c.json({ success: true, data: { id: resultado.valor.id as string } }, 201);
    } catch (error) {
      console.error("PropiedadController.crear:", error);
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }

  async listar(c: ContextoPropiedades): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearListarPropiedades(c);

      const resultado = await useCase.ejecutar({
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        const err = resultado.error as ErrorDeDominio;
        return c.json({ success: false, message: err.message, code: err.codigo }, 403);
      }

      const propiedades: PropiedadRespuestaDTO[] = resultado.valor.map((p) => ({
        id: p.id as string,
        titulo: p.titulo,
        descripcion: p.descripcion,
        precio: p.precio,
        idAsesor: p.idAsesor,
      }));

      return c.json({
        success: true,
        data: propiedades,
      });
    } catch (error) {
      console.error("PropiedadController.listar:", error);
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }
}

import { type Context } from "hono";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike, type SessionClaims } from "../../../shared/infrastructure";
import { CrearPropiedadUseCase, ListarPropiedadesUseCase } from "../../application";
import { type IAutorizadorPropiedades } from "../../domain/ports";
import { D1PropiedadRepository } from "../persistence/D1PropiedadRepository";
import { UuidGeneradorId } from "../../../shared/infrastructure/security/UuidGeneradorId";

export type BindingsPropiedades = {
  DB: D1DatabaseLike;
};

type AppVariables = {
  authPayload: SessionClaims;
};

type ContextoPropiedades = Context<{ Bindings: BindingsPropiedades; Variables: AppVariables }>;

export class PropiedadController {
  constructor(private readonly autorizador: IAutorizadorPropiedades) {}

  async crear(c: ContextoPropiedades): Promise<Response> {
    try {
      const body = await c.req.json<{
        titulo: string;
        descripcion: string;
        precio: number;
        idAsesor: string;
      }>();
      const authPayload = c.get("authPayload");
      const repo = new D1PropiedadRepository(c.env.DB);
      const generadorId = new UuidGeneradorId();
      const useCase = new CrearPropiedadUseCase(repo, generadorId, this.autorizador);

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
      const repo = new D1PropiedadRepository(c.env.DB);
      const useCase = new ListarPropiedadesUseCase(repo, this.autorizador);

      const resultado = await useCase.ejecutar({
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        const err = resultado.error as ErrorDeDominio;
        return c.json({ success: false, message: err.message, code: err.codigo }, 403);
      }

      return c.json({
        success: true,
        data: resultado.valor.map((p) => ({
          id: p.id as string,
          titulo: p.titulo,
          descripcion: p.descripcion,
          precio: p.precio,
          idAsesor: p.idAsesor,
        })),
      });
    } catch (error) {
      console.error("PropiedadController.listar:", error);
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }
}

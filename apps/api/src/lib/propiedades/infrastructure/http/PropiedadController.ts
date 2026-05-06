import { type Context } from "hono";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { CrearPropiedadUseCase, ListarPropiedadesUseCase } from "../../application";
import { D1PropiedadRepository } from "../persistence/D1PropiedadRepository";
import { UuidGeneradorId } from "../../../shared/infrastructure/security/UuidGeneradorId";
import { VerificadorDePermisosAdapter } from "../../../auth/infrastructure/adapters/VerificadorDePermisosAdapter";

export type BindingsPropiedades = {
  DB: D1DatabaseLike;
};

type SesionActiva = {
  idUsuario: string;
  rol: string;
};

type AppVariables = {
  authPayload: SesionActiva;
};

type ContextoPropiedades = Context<{ Bindings: BindingsPropiedades; Variables: AppVariables }>;

export class PropiedadController {
  async crear(c: ContextoPropiedades): Promise<Response> {
    try {
      const body = await c.req.json<{ titulo: string; descripcion: string; precio: number; idAsesor: string }>();
      const authPayload = c.get("authPayload");
      const repo = new D1PropiedadRepository(c.env.DB);
      const generadorId = new UuidGeneradorId();
      const verificadorPermisos = new VerificadorDePermisosAdapter();
      const useCase = new CrearPropiedadUseCase(repo, generadorId, verificadorPermisos);

      const resultado = await useCase.ejecutar({
        ...body,
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        return c.json({ success: false, message: resultado.error.message, code: (resultado.error as ErrorDeDominio).codigo }, 403);
      }

      return c.json({ success: true, data: { id: resultado.valor.id as string } }, 201);
    } catch (error) {
      console.error(error);
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }

  async listar(c: ContextoPropiedades): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const repo = new D1PropiedadRepository(c.env.DB);
      const verificadorPermisos = new VerificadorDePermisosAdapter();
      const useCase = new ListarPropiedadesUseCase(repo, verificadorPermisos);

      const resultado = await useCase.ejecutar({
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        return c.json({ success: false, message: resultado.error.message }, 403);
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
      console.error(error);
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }
}

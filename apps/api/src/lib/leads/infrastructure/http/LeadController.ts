import { type Context } from "hono";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { CrearLeadUseCase, ListarLeadsUseCase } from "../../application";
import { D1LeadRepository } from "../persistence/D1LeadRepository";
import { UuidGeneradorId } from "../../../shared/infrastructure/security/UuidGeneradorId";
import { VerificadorDePermisosAdapter } from "../../../auth/infrastructure/adapters/VerificadorDePermisosAdapter";

export type BindingsLeads = {
  DB: D1DatabaseLike;
};

type SesionActiva = {
  idUsuario: string;
  rol: string;
};

type AppVariables = {
  authPayload: SesionActiva;
};

type ContextoLeads = Context<{ Bindings: BindingsLeads; Variables: AppVariables }>;

export class LeadController {
  async crear(c: ContextoLeads): Promise<Response> {
    try {
      const body = await c.req.json<{ nombre: string; email: string; telefono: string; tipo: string; idAsesor: string }>();
      const authPayload = c.get("authPayload");
      const repo = new D1LeadRepository(c.env.DB);
      const generadorId = new UuidGeneradorId();
      const verificadorPermisos = new VerificadorDePermisosAdapter();
      const useCase = new CrearLeadUseCase(repo, generadorId, verificadorPermisos);

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

  async listar(c: ContextoLeads): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const repo = new D1LeadRepository(c.env.DB);
      const verificadorPermisos = new VerificadorDePermisosAdapter();
      const useCase = new ListarLeadsUseCase(repo, verificadorPermisos);

      const resultado = await useCase.ejecutar({
        usuarioAutenticado: { id: authPayload.idUsuario, rol: authPayload.rol },
      });

      if (!resultado.esExito) {
        return c.json({ success: false, message: resultado.error.message }, 403);
      }

      return c.json({
        success: true,
        data: resultado.valor.map((l) => ({
          id: l.id as string,
          nombre: l.nombre,
          email: l.email,
          telefono: l.telefono,
          tipo: l.tipo.valor,
          idAsesor: l.idAsesor,
          creadoEn: l.creadoEn,
        })),
      });
    } catch (error) {
      console.error(error);
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }
}

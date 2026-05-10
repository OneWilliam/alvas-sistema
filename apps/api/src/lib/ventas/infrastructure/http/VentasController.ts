import { type Context } from "hono";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { 
  RegistrarLeadUseCase, 
  AgendarCitaUseCase, 
  ConvertirLeadAClienteUseCase, 
  RegistrarClienteDirectoUseCase,
  ActualizarLeadUseCase,
  ActualizarCitaUseCase
} from "../../application";
import { D1VentasRepository } from "../persistence/D1VentasRepository";
import { UuidGeneradorId } from "../../../shared/infrastructure/security/UuidGeneradorId";
import { idUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";

export type BindingsVentas = {
  DB: D1DatabaseLike;
};

type AppVariables = {
  authPayload: { idUsuario: string; rol: string };
};

type ContextoVentas = Context<{ Bindings: BindingsVentas; Variables: AppVariables }>;

export class VentasController {
  async registrarLead(c: ContextoVentas): Promise<Response> {
    try {
      const body = await c.req.json<{ nombre: string; email: string; telefono: string; tipo: string; idPropiedadInteres?: string }>();
      const authPayload = c.get("authPayload");
      const repo = new D1VentasRepository(c.env.DB);
      const generadorId = new UuidGeneradorId();
      const useCase = new RegistrarLeadUseCase(repo, generadorId);

      const resultado = await useCase.ejecutar({
        ...body,
        idAsesor: authPayload.idUsuario,
      });

      if (!resultado.esExito) {
        return c.json({ success: false, message: resultado.error.message, code: resultado.error.codigo }, 400);
      }

      return c.json({ success: true, data: { id: resultado.valor.id as string } }, 201);
    } catch {
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }

  async agendarCita(c: ContextoVentas): Promise<Response> {
    try {
      const body = await c.req.json<{ idLead: string; idPropiedad?: string; fechaInicio: string; duracionMinutos: number; observacion?: string }>();
      const repo = new D1VentasRepository(c.env.DB);
      const generadorId = new UuidGeneradorId();
      const useCase = new AgendarCitaUseCase(repo, generadorId);

      const resultado = await useCase.ejecutar({
        ...body,
        fechaInicio: new Date(body.fechaInicio),
      });

      if (!resultado.esExito) {
        return c.json({ success: false, message: resultado.error.message, code: resultado.error.codigo }, 400);
      }

      return c.json({ success: true, message: "Cita agendada" });
    } catch {
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }

  async registrarClienteDirecto(c: ContextoVentas): Promise<Response> {
    try {
      const body = await c.req.json<{ nombre: string; email: string; telefono: string }>();
      const authPayload = c.get("authPayload");
      const repo = new D1VentasRepository(c.env.DB);
      const generadorId = new UuidGeneradorId();
      const useCase = new RegistrarClienteDirectoUseCase(repo, generadorId);

      const resultado = await useCase.ejecutar({
        ...body,
        idAsesor: authPayload.idUsuario,
      });

      if (!resultado.esExito) {
        return c.json({ success: false, message: resultado.error.message, code: resultado.error.codigo }, 400);
      }

      return c.json({ success: true, data: { id: resultado.valor.id as string } }, 201);
    } catch {
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }

  async convertirACliente(c: ContextoVentas): Promise<Response> {
    try {
      const { idLead } = await c.req.json<{ idLead: string }>();
      const repo = new D1VentasRepository(c.env.DB);
      const generadorId = new UuidGeneradorId();
      const useCase = new ConvertirLeadAClienteUseCase(repo, generadorId);

      const resultado = await useCase.ejecutar({ idLead });

      if (!resultado.esExito) {
        return c.json({ success: false, message: resultado.error.message, code: resultado.error.codigo }, 400);
      }

      return c.json({ success: true, data: { idCliente: resultado.valor.id as string } });
    } catch {
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }

  async editarLead(c: ContextoVentas): Promise<Response> {
    try {
      const id = c.req.param("id") ?? "";
      const body = await c.req.json<{ nombre?: string; email?: string; telefono?: string; tipo?: string }>();
      const repo = new D1VentasRepository(c.env.DB);
      const useCase = new ActualizarLeadUseCase(repo);

      const resultado = await useCase.ejecutar({ id, ...body });

      if (!resultado.esExito) return c.json({ success: false, message: resultado.error.message }, 400);

      return c.json({ success: true, message: "Lead actualizado" });
    } catch {
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }

  async editarCita(c: ContextoVentas): Promise<Response> {
    try {
      const idLead = c.req.param("idLead") ?? "";
      const idCita = c.req.param("idCita") ?? "";
      const body = await c.req.json<{ fechaInicio?: string; duracionMinutos?: number; observacion?: string }>();
      const repo = new D1VentasRepository(c.env.DB);
      const useCase = new ActualizarCitaUseCase(repo);

      const resultado = await useCase.ejecutar({
        idLead,
        idCita,
        ...body,
        fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : undefined,
      });

      if (!resultado.esExito) return c.json({ success: false, message: resultado.error.message }, 400);

      return c.json({ success: true, message: "Cita actualizada" });
    } catch {
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }

  async listarPipeline(c: ContextoVentas): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const repo = new D1VentasRepository(c.env.DB);
      
      const leads = await repo.listarLeadsPorAsesor(idUsuarioRef(authPayload.idUsuario));
      
      return c.json({
        success: true,
        data: leads.map(l => ({
          id: l.id as string,
          nombre: l.nombre,
          estado: l.estado.valor,
          tipo: l.tipo.valor,
          citasCount: l.citas.length
        }))
      });
    } catch {
      return c.json({ success: false, message: "Error interno" }, 500);
    }
  }
}

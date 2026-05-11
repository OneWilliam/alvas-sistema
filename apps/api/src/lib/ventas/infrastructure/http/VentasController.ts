import { type Context } from "hono";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike, type SessionClaims } from "../../../shared/infrastructure";
import {
  RegistrarLeadUseCase,
  AgendarCitaUseCase,
  ConvertirLeadAClienteUseCase,
  RegistrarClienteDirectoUseCase,
  ActualizarLeadUseCase,
  ActualizarCitaUseCase,
  EvaluarLeadParaAsignarUseCase,
} from "../../application";
import { D1VentasRepository } from "../persistence/D1VentasRepository";
import { UuidGeneradorId } from "../../../shared/infrastructure/security/UuidGeneradorId";
import { idUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";

export type BindingsVentas = {
  DB: D1DatabaseLike;
};

type AppVariables = {
  authPayload: SessionClaims;
};

type ContextoVentas = Context<{ Bindings: BindingsVentas; Variables: AppVariables }>;

export class VentasController {
  private jsonDominioFallo(
    c: ContextoVentas,
    error: ErrorDeDominio,
    status: 400 | 401 | 403 | 404 | 409 = 400,
  ): Response {
    return c.json({ success: false, message: error.message, code: error.codigo }, status);
  }

  async registrarLead(c: ContextoVentas): Promise<Response> {
    try {
      const body = await c.req.json<{
        nombre: string;
        email: string;
        telefono: string;
        tipo: string;
        idPropiedadInteres?: string;
        idAsesor?: string;
      }>();
      const authPayload = c.get("authPayload");
      const repo = new D1VentasRepository(c.env.DB);
      const generadorId = new UuidGeneradorId();
      const evaluador = new EvaluarLeadParaAsignarUseCase(repo);
      const useCase = new RegistrarLeadUseCase(repo, generadorId, evaluador);

      const resultado = await useCase.ejecutar({
        ...body,
        idAsesor: body.idAsesor ?? authPayload.idUsuario,
      });

      if (!resultado.esExito) {
        return this.jsonDominioFallo(c, resultado.error);
      }

      return c.json({ success: true, data: { id: resultado.valor.id as string } }, 201);
    } catch (error) {
      console.error("VentasController.registrarLead:", error);
      return c.json(
        { success: false, message: "Error interno", code: "VENTAS_ERROR_INTERNO" },
        500,
      );
    }
  }

  async agendarCita(c: ContextoVentas): Promise<Response> {
    try {
      const body = await c.req.json<{
        idLead: string;
        idPropiedad?: string;
        fechaInicio: string;
        duracionMinutos: number;
        observacion?: string;
      }>();
      const repo = new D1VentasRepository(c.env.DB);
      const generadorId = new UuidGeneradorId();
      const useCase = new AgendarCitaUseCase(repo, generadorId);

      const resultado = await useCase.ejecutar({
        ...body,
        fechaInicio: new Date(body.fechaInicio),
      });

      if (!resultado.esExito) {
        return this.jsonDominioFallo(c, resultado.error);
      }

      return c.json({ success: true, message: "Cita agendada" });
    } catch (error) {
      console.error("VentasController.agendarCita:", error);
      return c.json(
        { success: false, message: "Error interno", code: "VENTAS_ERROR_INTERNO" },
        500,
      );
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
        return this.jsonDominioFallo(c, resultado.error);
      }

      return c.json({ success: true, data: { id: resultado.valor.id as string } }, 201);
    } catch (error) {
      console.error("VentasController.registrarClienteDirecto:", error);
      return c.json(
        { success: false, message: "Error interno", code: "VENTAS_ERROR_INTERNO" },
        500,
      );
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
        return this.jsonDominioFallo(c, resultado.error);
      }

      return c.json({ success: true, data: { idCliente: resultado.valor.id as string } });
    } catch (error) {
      console.error("VentasController.convertirACliente:", error);
      return c.json(
        { success: false, message: "Error interno", code: "VENTAS_ERROR_INTERNO" },
        500,
      );
    }
  }

  async editarLead(c: ContextoVentas): Promise<Response> {
    try {
      const id = c.req.param("id") ?? "";
      const body = await c.req.json<{
        nombre?: string;
        email?: string;
        telefono?: string;
        tipo?: string;
      }>();
      const repo = new D1VentasRepository(c.env.DB);
      const useCase = new ActualizarLeadUseCase(repo);

      const resultado = await useCase.ejecutar({ id, ...body });

      if (!resultado.esExito) {
        return this.jsonDominioFallo(c, resultado.error);
      }

      return c.json({ success: true, message: "Lead actualizado" });
    } catch (error) {
      console.error("VentasController.editarLead:", error);
      return c.json(
        { success: false, message: "Error interno", code: "VENTAS_ERROR_INTERNO" },
        500,
      );
    }
  }

  async editarCita(c: ContextoVentas): Promise<Response> {
    try {
      const idLead = c.req.param("idLead") ?? "";
      const idCita = c.req.param("idCita") ?? "";
      const body = await c.req.json<{
        fechaInicio?: string;
        duracionMinutos?: number;
        observacion?: string;
      }>();
      const repo = new D1VentasRepository(c.env.DB);
      const useCase = new ActualizarCitaUseCase(repo);

      const resultado = await useCase.ejecutar({
        idLead,
        idCita,
        ...body,
        fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : undefined,
      });

      if (!resultado.esExito) {
        return this.jsonDominioFallo(c, resultado.error);
      }

      return c.json({ success: true, message: "Cita actualizada" });
    } catch (error) {
      console.error("VentasController.editarCita:", error);
      return c.json(
        { success: false, message: "Error interno", code: "VENTAS_ERROR_INTERNO" },
        500,
      );
    }
  }

  async listarPipeline(c: ContextoVentas): Promise<Response> {
    try {
      const authPayload = c.get("authPayload");
      const repo = new D1VentasRepository(c.env.DB);

      const leads = await repo.listarLeadsPorAsesor(idUsuarioRef(authPayload.idUsuario));

      return c.json({
        success: true,
        data: leads.map((l) => ({
          id: l.id as string,
          nombre: l.nombre,
          estado: l.estado.valor,
          tipo: l.tipo.valor,
          citasCount: l.citas.length,
        })),
      });
    } catch (error) {
      console.error("VentasController.listarPipeline:", error);
      return c.json(
        { success: false, message: "Error interno", code: "VENTAS_ERROR_INTERNO" },
        500,
      );
    }
  }
}

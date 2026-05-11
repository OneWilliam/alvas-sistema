import { type Context } from "hono";
import { ErrorDeDominio } from "../../../shared/domain";
import { type D1DatabaseLike, type SessionClaims } from "../../../shared/infrastructure";
import {
  type IActualizarCita,
  type IActualizarCliente,
  type IActualizarLead,
  type IAgendarCita,
  type IConvertirLeadACliente,
  type IListarLeadsPorAsesor,
  type IRegistrarClienteDirecto,
  type IRegistrarLead,
} from "../../application";
import {
  type ActualizarCitaBodyDTO,
  type ActualizarLeadBodyDTO,
  type AgendarCitaInputDTO,
  type ConvertirLeadInputDTO,
  type RegistrarLeadInputDTO,
} from "../../application/dto/LeadDTOs";
import { type RegistrarClienteDirectoInputDTO } from "../../application/dto/ClienteDTOs";

export type BindingsVentas = {
  DB: D1DatabaseLike;
};

type AppVariables = {
  authPayload: SessionClaims;
};

type ContextoVentas = Context<{ Bindings: BindingsVentas; Variables: AppVariables }>;

export type VentasControllerDeps = Readonly<{
  crearRegistrarLead: (c: ContextoVentas) => IRegistrarLead;
  crearAgendarCita: (c: ContextoVentas) => IAgendarCita;
  crearRegistrarClienteDirecto: (c: ContextoVentas) => IRegistrarClienteDirecto;
  crearConvertirLeadACliente: (c: ContextoVentas) => IConvertirLeadACliente;
  crearActualizarLead: (c: ContextoVentas) => IActualizarLead;
  crearActualizarCita: (c: ContextoVentas) => IActualizarCita;
  crearListarLeadsPorAsesor: (c: ContextoVentas) => IListarLeadsPorAsesor;
  crearActualizarCliente?: (c: ContextoVentas) => IActualizarCliente;
}>;

export class VentasController {
  constructor(private readonly deps: VentasControllerDeps) {}

  private jsonDominioFallo(
    c: ContextoVentas,
    error: ErrorDeDominio,
    status: 400 | 401 | 403 | 404 | 409 = 400,
  ): Response {
    return c.json({ success: false, message: error.message, code: error.codigo }, status);
  }

  async registrarLead(c: ContextoVentas): Promise<Response> {
    try {
      const body = await c.req.json<RegistrarLeadInputDTO>();
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearRegistrarLead(c);

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
      const body = await c.req.json<AgendarCitaInputDTO>();
      const useCase = this.deps.crearAgendarCita(c);

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
      const body = await c.req.json<RegistrarClienteDirectoInputDTO>();
      const authPayload = c.get("authPayload");
      const useCase = this.deps.crearRegistrarClienteDirecto(c);

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
      const body = await c.req.json<ConvertirLeadInputDTO>();
      const useCase = this.deps.crearConvertirLeadACliente(c);
      const resultado = await useCase.ejecutar(body);

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
      const body = await c.req.json<ActualizarLeadBodyDTO>();
      const useCase = this.deps.crearActualizarLead(c);

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
      const body = await c.req.json<ActualizarCitaBodyDTO>();
      const useCase = this.deps.crearActualizarCita(c);

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
      const useCase = this.deps.crearListarLeadsPorAsesor(c);
      const resultado = await useCase.ejecutar({ idAsesor: authPayload.idUsuario });

      if (!resultado.esExito) {
        return this.jsonDominioFallo(c, resultado.error);
      }

      const leads = resultado.valor;

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

import {
  type ActividadRecienteLectura,
  type AsesorConTotalLeads,
  type ClienteLecturaParaReportes,
  type IConsultaVentasParaReportes,
  type LeadLecturaParaReportes,
} from "../../../reportes/domain/ports/IConsultaVentasParaReportes";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";

export class ConsultaVentasParaReportesAdapter implements IConsultaVentasParaReportes {
  constructor(private readonly ventas: IVentasRepository) {}

  async listarLeadsParaReporte(): Promise<LeadLecturaParaReportes[]> {
    const leads = await this.ventas.listarLeads();
    return leads.map((l) => ({
      id: l.id as string,
      estado: l.estado.valor,
      creadoEn: l.creadoEn,
      citas: l.citas.map((c) => ({ estado: c.estado })),
    }));
  }

  async listarClientesParaReporte(): Promise<ClienteLecturaParaReportes[]> {
    const clientes = await this.ventas.listarClientes();
    return clientes.map((c) => ({ id: c.id as string }));
  }

  async obtenerActividadReciente(limite: number): Promise<ActividadRecienteLectura[]> {
    return this.ventas.obtenerActividadReciente(limite);
  }

  async listarAsesoresConTotalesLeads(): Promise<AsesorConTotalLeads[]> {
    const rows = await this.ventas.listarAsesoresConLeads();
    return rows.map((r) => ({
      idAsesor: r.idAsesor as string,
      totalLeads: r.totalLeads,
    }));
  }
}

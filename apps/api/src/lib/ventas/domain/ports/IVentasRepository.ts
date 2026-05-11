import { Lead } from "../entities/Lead";
import { Cliente } from "../entities/Cliente";
import { type IdLead, type IdCliente } from "../value-objects/Ids";
import { type IdUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";

export interface IVentasRepository {
  // Gestión de Leads
  obtenerLeadPorId(id: IdLead): Promise<Lead | null>;
  guardarLead(lead: Lead): Promise<void>;
  listarLeads(): Promise<Lead[]>;
  listarLeadsPorAsesor(idAsesor: IdUsuarioRef): Promise<Lead[]>;
  listarLeadsPorEstado(estado: string): Promise<Lead[]>;

  // Gestión de Clientes
  obtenerClientePorId(id: IdCliente): Promise<Cliente | null>;
  guardarCliente(cliente: Cliente): Promise<void>;
  listarClientes(): Promise<Cliente[]>;
  listarClientesPorAsesor(idAsesor: IdUsuarioRef): Promise<Cliente[]>;

  // Actividad
  registrarActividad(idLead: IdLead, evento: string, descripcion: string): Promise<void>;
  obtenerActividadReciente(
    limite: number,
  ): Promise<{ idLead: string; evento: string; descripcion: string; fecha: string }[]>;

  // Estadísticas y Reportes
  listarAsesoresConLeads(): Promise<{ idAsesor: IdUsuarioRef; totalLeads: number }[]>;
}

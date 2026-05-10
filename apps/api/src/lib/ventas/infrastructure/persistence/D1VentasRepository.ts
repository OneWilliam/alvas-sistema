import { eq } from "drizzle-orm";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { obtenerDb } from "../../../shared/infrastructure/persistence/drizzle";
import { Lead } from "../../domain/entities/Lead";
import { Cliente } from "../../domain/entities/Cliente";
import { type IdLead, type IdCliente } from "../../domain/value-objects/Ids";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { type IdUsuarioRef } from "../../../shared/domain/value-objects/IdUsuarioRef";
import { 
  leadsTable, 
  clientesTable, 
  citasVentasTable, 
  actividadVentasTable,
  type LeadRow,
  type ClienteRow,
  type CitaVentaRow
} from "./schema";
import { VentasMapper } from "./VentasMapper";

export class D1VentasRepository implements IVentasRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  private drizzle() {
    return obtenerDb(this.db);
  }

  // --- LEADS ---

  async obtenerLeadPorId(id: IdLead): Promise<Lead | null> {
    const leadRow = await this.drizzle()
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.id, id as string))
      .get();

    if (!leadRow) return null;

    const citasRows = await this.drizzle()
      .select()
      .from(citasVentasTable)
      .where(eq(citasVentasTable.idLead, id as string))
      .all();

    return VentasMapper.leadADominio(leadRow as LeadRow, citasRows as CitaVentaRow[]);
  }

  async guardarLead(lead: Lead): Promise<void> {
    const leadValues = VentasMapper.leadAPersistencia(lead);
    
    // Guardar Lead
    await this.drizzle()
      .insert(leadsTable)
      .values(leadValues)
      .onConflictDoUpdate({
        target: leadsTable.id,
        set: leadValues,
      });

    // Guardar Citas (Sincronización simple: borrar y re-insertar para este MVP)
    await this.drizzle()
      .delete(citasVentasTable)
      .where(eq(citasVentasTable.idLead, lead.id as string));

    if (lead.citas.length > 0) {
      const citasValues = lead.citas.map(VentasMapper.citaAPersistencia);
      await this.drizzle().insert(citasVentasTable).values(citasValues);
    }
  }

  async listarLeads(): Promise<Lead[]> {
    const rows = await this.drizzle().select().from(leadsTable).all();
    const result: Lead[] = [];
    for (const row of rows) {
      const citas = await this.drizzle()
        .select()
        .from(citasVentasTable)
        .where(eq(citasVentasTable.idLead, row.id))
        .all();
      result.push(VentasMapper.leadADominio(row as LeadRow, citas as CitaVentaRow[]));
    }
    return result;
  }

  async listarLeadsPorAsesor(idAsesor: IdUsuarioRef): Promise<Lead[]> {
    const rows = await this.drizzle()
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.idAsesor, idAsesor as string))
      .all();
    
    const result: Lead[] = [];
    for (const row of rows) {
      const citas = await this.drizzle()
        .select()
        .from(citasVentasTable)
        .where(eq(citasVentasTable.idLead, row.id))
        .all();
      result.push(VentasMapper.leadADominio(row as LeadRow, citas as CitaVentaRow[]));
    }
    return result;
  }

  // --- CLIENTES ---

  async obtenerClientePorId(id: IdCliente): Promise<Cliente | null> {
    const row = await this.drizzle()
      .select()
      .from(clientesTable)
      .where(eq(clientesTable.id, id as string))
      .get();
    return row ? VentasMapper.clienteADominio(row as ClienteRow) : null;
  }

  async guardarCliente(cliente: Cliente): Promise<void> {
    const values = VentasMapper.clienteAPersistencia(cliente);
    await this.drizzle()
      .insert(clientesTable)
      .values(values)
      .onConflictDoUpdate({
        target: clientesTable.id,
        set: values,
      });
  }

  async listarClientes(): Promise<Cliente[]> {
    const rows = await this.drizzle().select().from(clientesTable).all();
    return rows.map(row => VentasMapper.clienteADominio(row as ClienteRow));
  }

  async listarClientesPorAsesor(idAsesor: IdUsuarioRef): Promise<Cliente[]> {
    const rows = await this.drizzle()
      .select()
      .from(clientesTable)
      .where(eq(clientesTable.idAsesor, idAsesor as string))
      .all();
    return rows.map(row => VentasMapper.clienteADominio(row as ClienteRow));
  }

  // --- ACTIVIDAD ---

  async registrarActividad(idLead: IdLead, evento: string, descripcion: string): Promise<void> {
    await this.drizzle().insert(actividadVentasTable).values({
      idLead: idLead as string,
      evento,
      descripcion,
      fecha: new Date().toISOString(),
    });
  }
}

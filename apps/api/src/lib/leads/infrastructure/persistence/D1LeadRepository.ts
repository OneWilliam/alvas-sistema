import { eq } from "drizzle-orm";
import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { Lead } from "../../domain/entities";
import { type ILeadRepository } from "../../domain/ports";
import { type IdLead, type IdUsuarioRef } from "../../domain/value-objects";
import { obtenerDb } from "../../../shared/infrastructure/persistence/drizzle";
import { leadsTable, type LeadRow } from "./schema";
import { LeadMapper } from "./LeadMapper";

export class D1LeadRepository implements ILeadRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  private drizzle() {
    return obtenerDb(this.db);
  }

  async obtenerPorId(id: IdLead): Promise<Lead | null> {
    const row = await this.drizzle()
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.id, id as string))
      .get();
    return row ? LeadMapper.aDominio(row as LeadRow) : null;
  }

  async existePorId(id: IdLead): Promise<boolean> {
    const row = await this.drizzle()
      .select({ id: leadsTable.id })
      .from(leadsTable)
      .where(eq(leadsTable.id, id as string))
      .get();
    return !!row;
  }

  async eliminarPorId(id: IdLead): Promise<void> {
    await this.drizzle().delete(leadsTable).where(eq(leadsTable.id, id as string));
  }

  async guardar(lead: Lead): Promise<void> {
    const values = LeadMapper.aPersistencia(lead);
    await this.drizzle()
      .insert(leadsTable)
      .values(values)
      .onConflictDoUpdate({
        target: leadsTable.id,
        set: values,
      });
  }

  async listarTodos(): Promise<Lead[]> {
    const rows = await this.drizzle().select().from(leadsTable);
    return rows.map((row) => LeadMapper.aDominio(row as LeadRow));
  }

  async obtenerPorAsesor(idAsesor: IdUsuarioRef): Promise<Lead[]> {
    const rows = await this.drizzle()
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.idAsesor, idAsesor as string));
    return rows.map((row) => LeadMapper.aDominio(row as LeadRow));
  }
}

import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const leadsTable = sqliteTable("leads", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull(),
  telefono: text("telefono").notNull(),
  tipo: text("tipo").notNull(),
  idAsesor: text("id_asesor").notNull(),
  creadoEn: text("creado_en").notNull(),
  actualizadoEn: text("actualizado_en").notNull(),
});

export type LeadRow = typeof leadsTable.$inferSelect;
export type NuevaLeadRow = typeof leadsTable.$inferInsert;

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const propiedadesTable = sqliteTable("propiedades", {
  id: text("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion").notNull(),
  precio: integer("precio").notNull(),
  origen: text("origen").notNull().default("ALVAS"),
  estado: text("estado").notNull().default("DISPONIBLE"),
  idLeadOrigen: text("id_lead_origen"),
  idClientePropietario: text("id_cliente_propietario"),
  captadaPorAsesorId: text("captada_por_asesor_id"),
  asesorResponsableId: text("asesor_responsable_id"),
  creadoEn: text("creado_en").notNull(),
  actualizadoEn: text("actualizado_en").notNull(),
});

export type PropiedadRow = typeof propiedadesTable.$inferSelect;
export type NuevaPropiedadRow = typeof propiedadesTable.$inferInsert;

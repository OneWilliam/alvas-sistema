import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const propiedadesTable = sqliteTable("propiedades", {
  id: text("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion").notNull(),
  precio: integer("precio").notNull(),
  idAsesor: text("id_asesor").notNull(),
  creadoEn: text("creado_en").notNull(),
  actualizadoEn: text("actualizado_en").notNull(),
});

export type PropiedadRow = typeof propiedadesTable.$inferSelect;
export type NuevaPropiedadRow = typeof propiedadesTable.$inferInsert;

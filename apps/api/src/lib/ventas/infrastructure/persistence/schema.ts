import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const leadsTable = sqliteTable("ventas_leads", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull(),
  telefono: text("telefono").notNull(),
  tipo: text("tipo").notNull(), // COMPRA, VENTA
  estado: text("estado").notNull(), // NUEVO, CONTACTO, etc.
  idAsesor: text("id_asesor").notNull(),
  idCliente: text("id_cliente"),
  idPropiedadInteres: text("id_propiedad_interes"),
  creadoEn: text("creado_en").notNull(),
  actualizadoEn: text("actualizado_en").notNull(),
});

export const clientesTable = sqliteTable("ventas_clientes", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull(),
  telefono: text("telefono").notNull(),
  idAsesor: text("id_asesor").notNull(),
  idLeadOrigen: text("id_lead_origen"),
  creadoEn: text("creado_en").notNull(),
  actualizadoEn: text("actualizado_en").notNull(),
});

export const citasVentasTable = sqliteTable("ventas_citas", {
  id: text("id").primaryKey(),
  idLead: text("id_lead").notNull(),
  idPropiedad: text("id_propiedad"),
  fechaInicio: text("fecha_inicio").notNull(),
  fechaFin: text("fecha_fin").notNull(),
  estado: text("estado").notNull(),
  observacion: text("observacion"),
});

export const actividadVentasTable = sqliteTable("ventas_actividad", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  idLead: text("id_lead").notNull(),
  evento: text("evento").notNull(),
  descripcion: text("descripcion").notNull(),
  fecha: text("fecha").notNull(),
});

export type LeadRow = typeof leadsTable.$inferSelect;
export type ClienteRow = typeof clientesTable.$inferSelect;
export type CitaVentaRow = typeof citasVentasTable.$inferSelect;
export type ActividadVentaRow = typeof actividadVentasTable.$inferSelect;

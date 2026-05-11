/**
 * Puerto de lectura: el módulo reportes no depende de entidades de ventas.
 * Los snapshots son proyecciones mínimas para métricas y reportes.
 */
export type LeadLecturaParaReportes = Readonly<{
  id: string;
  estado: string;
  creadoEn: Date;
  citas: ReadonlyArray<Readonly<{ estado: string }>>;
}>;

export type ClienteLecturaParaReportes = Readonly<{
  id: string;
}>;

export type ActividadRecienteLectura = Readonly<{
  idLead: string;
  evento: string;
  descripcion: string;
  fecha: string;
}>;

export type AsesorConTotalLeads = Readonly<{
  idAsesor: string;
  totalLeads: number;
}>;

export interface IConsultaVentasParaReportes {
  listarLeadsParaReporte(): Promise<LeadLecturaParaReportes[]>;
  listarClientesParaReporte(): Promise<ClienteLecturaParaReportes[]>;
  obtenerActividadReciente(limite: number): Promise<ActividadRecienteLectura[]>;
  listarAsesoresConTotalesLeads(): Promise<AsesorConTotalLeads[]>;
}

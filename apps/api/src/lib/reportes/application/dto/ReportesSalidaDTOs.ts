export type MetricasReporteGeneralDTO = Readonly<{
  conversionRate: number;
  leadsNuevosHoy: number;
  citasPendientes: number;
}>;

export type ReporteGeneralOutput = Readonly<{
  fechaGeneracion: Date;
  metricas: MetricasReporteGeneralDTO;
  actividadReciente: ReadonlyArray<{
    idLead: string;
    evento: string;
    descripcion: string;
    fecha: string;
  }>;
}>;

export type EstadisticasGlobalesOutput = Readonly<{
  totalLeads: number;
  totalClientes: number;
  leadsPorEstado: Readonly<Record<string, number>>;
  asesoresActivos: number;
}>;

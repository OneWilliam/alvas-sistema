export type ActividadReporte = Readonly<{
  idLead: string;
  evento: string;
  descripcion: string;
  fecha: string;
}>;

export class ReporteGeneral {
  constructor(
    readonly fechaGeneracion: Date,
    readonly metricas: Readonly<{
      conversionRate: number;
      leadsNuevosHoy: number;
      citasPendientes: number;
    }>,
    readonly actividadReciente: ReadonlyArray<ActividadReporte>,
  ) {}
}

export class EstadisticasGlobales {
  constructor(
    readonly totalLeads: number,
    readonly totalClientes: number,
    readonly leadsPorEstado: Readonly<Record<string, number>>,
    readonly asesoresActivos: number,
  ) {}
}

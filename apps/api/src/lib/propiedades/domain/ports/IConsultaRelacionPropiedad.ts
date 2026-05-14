export type RelacionPropiedad = Readonly<{
  idLeadOrigen?: string;
  idClientePropietario?: string;
}>;

export interface IConsultaRelacionPropiedad {
  asesorGestionaPropiedad(idAsesor: string, relacion: RelacionPropiedad): Promise<boolean>;
}

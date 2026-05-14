export type CrearPropiedadDTO = Readonly<{
  titulo: string;
  descripcion: string;
  precio: number;
  origen?: string;
  estado?: string;
  idLeadOrigen?: string;
  idClientePropietario?: string;
  captadaPorAsesorId?: string;
  asesorResponsableId?: string;
}>;

export type ActualizarPropiedadDTO = Readonly<{
  titulo?: string;
  descripcion?: string;
  precio?: number;
  estado?: string;
  idClientePropietario?: string;
  asesorResponsableId?: string;
}>;

export type PropiedadRespuestaDTO = Readonly<{
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  origen: string;
  estado: string;
  idLeadOrigen?: string;
  idClientePropietario?: string;
  captadaPorAsesorId?: string;
  asesorResponsableId?: string;
}>;

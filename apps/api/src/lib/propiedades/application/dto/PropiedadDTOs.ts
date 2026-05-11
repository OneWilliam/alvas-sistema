export type CrearPropiedadDTO = Readonly<{
  titulo: string;
  descripcion: string;
  precio: number;
  idAsesor: string;
}>;

export type PropiedadRespuestaDTO = Readonly<{
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  idAsesor: string;
}>;

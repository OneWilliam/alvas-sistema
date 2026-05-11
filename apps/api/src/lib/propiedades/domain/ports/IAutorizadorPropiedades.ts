export interface IAutorizadorPropiedades {
  puedeVerPropiedadesGlobales(rol: string): boolean;
  puedeAsignarPropiedad(idUsuario: string, idAsesorDePropiedad: string): boolean;
}

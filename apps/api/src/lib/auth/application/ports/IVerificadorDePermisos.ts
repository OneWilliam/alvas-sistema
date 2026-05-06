export interface IVerificadorDePermisos {
  puedeVerLeadsGlobales(rol: string): boolean;
  puedeVerPropiedadesGlobales(rol: string): boolean;
  esPropietarioDeLead(idUsuario: string, idAsesorDelLead: string): boolean;
  esPropietarioDePropiedad(idUsuario: string, idAsesorDePropiedad: string): boolean;
}

export interface IAutorizadorVentas {
  puedeVerLeadsGlobales(rol: string): boolean;
  esPropietarioDeLead(idUsuario: string, idAsesorDelLead: string): boolean;
}

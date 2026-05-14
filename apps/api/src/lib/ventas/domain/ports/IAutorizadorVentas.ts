export interface IAutorizadorVentas {
  puedeVerLeadsGlobales(rol: string): boolean;
  puedeGestionarLead(rol: string, idUsuario: string, idAsesorDelLead: string): boolean;
  esPropietarioDeLead(idUsuario: string, idAsesorDelLead: string): boolean;
}

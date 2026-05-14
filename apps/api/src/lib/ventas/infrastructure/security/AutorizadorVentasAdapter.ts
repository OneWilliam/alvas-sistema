import { type IAutorizadorVentas } from "../../domain/ports/IAutorizadorVentas";

export class AutorizadorVentasAdapter implements IAutorizadorVentas {
  puedeVerLeadsGlobales(rol: string): boolean {
    return rol === "ADMIN";
  }

  puedeGestionarLead(rol: string, idUsuario: string, idAsesorDelLead: string): boolean {
    return rol === "ADMIN" || this.esPropietarioDeLead(idUsuario, idAsesorDelLead);
  }

  esPropietarioDeLead(idUsuario: string, idAsesorDelLead: string): boolean {
    return idUsuario === idAsesorDelLead;
  }
}

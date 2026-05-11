import { type IAutorizadorVentas } from "../../domain/ports/IAutorizadorVentas";

export class AutorizadorVentasAdapter implements IAutorizadorVentas {
  puedeVerLeadsGlobales(rol: string): boolean {
    return rol === "ADMIN";
  }

  esPropietarioDeLead(idUsuario: string, idAsesorDelLead: string): boolean {
    return idUsuario === idAsesorDelLead;
  }
}

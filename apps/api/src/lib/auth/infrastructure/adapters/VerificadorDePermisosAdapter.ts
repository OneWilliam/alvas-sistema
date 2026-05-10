import { type IVerificadorDePermisos } from "../../domain/ports/IVerificadorDePermisos";

export class VerificadorDePermisosAdapter implements IVerificadorDePermisos {
  puedeVerLeadsGlobales(rol: string): boolean {
    return rol === "ADMIN";
  }

  puedeVerPropiedadesGlobales(rol: string): boolean {
    return rol === "ADMIN";
  }

  esPropietarioDeLead(idUsuario: string, idAsesorDelLead: string): boolean {
    return idUsuario === idAsesorDelLead;
  }

  esPropietarioDePropiedad(idUsuario: string, idAsesorDePropiedad: string): boolean {
    return idUsuario === idAsesorDePropiedad;
  }
}

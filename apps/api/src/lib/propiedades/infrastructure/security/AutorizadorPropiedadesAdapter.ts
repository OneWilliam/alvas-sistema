import { type IAutorizadorPropiedades } from "../../domain/ports";

export class AutorizadorPropiedadesAdapter implements IAutorizadorPropiedades {
  puedeVerPropiedadesGlobales(rol: string): boolean {
    return rol === "ADMIN";
  }

  puedeAsignarPropiedad(idUsuario: string, idAsesorDePropiedad: string): boolean {
    return idUsuario === idAsesorDePropiedad;
  }
}

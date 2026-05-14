import { type IAutorizadorPropiedades } from "../../domain/ports";

export class AutorizadorPropiedadesAdapter implements IAutorizadorPropiedades {
  puedeVerPropiedades(rol: string): boolean {
    return rol === "ADMIN" || rol === "ASESOR";
  }

  puedeGestionarPropiedades(rol: string): boolean {
    return rol === "ADMIN";
  }

  puedeEditarPropiedadRelacionada(rol: string): boolean {
    return rol === "ADMIN" || rol === "ASESOR";
  }
}

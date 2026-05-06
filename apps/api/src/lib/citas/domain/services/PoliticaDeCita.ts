export class PoliticaDeCita {
  static puedeCrearParaOtroUsuario(rol: string): boolean {
    return rol === "ADMIN";
  }

  static puedeVerTodasLasCitas(rol: string): boolean {
    return rol === "ADMIN";
  }
}

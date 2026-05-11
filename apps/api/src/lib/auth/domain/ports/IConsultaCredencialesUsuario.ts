import { type ValorRolAcceso } from "../value-objects/RolAcceso";

export type CredencialesUsuario = Readonly<{
  idUsuario: string;
  username: string;
  hashClave: string;
  rol: ValorRolAcceso;
  estado: string;
}>;

export interface IConsultaCredencialesUsuario {
  buscarPorId(idUsuario: string): Promise<CredencialesUsuario | null>;
  buscarPorUsername(username: string): Promise<CredencialesUsuario | null>;
}

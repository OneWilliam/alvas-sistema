import { type ValorRolAcceso } from "../value-objects/RolAcceso";

export type PayloadToken = {
  idUsuario: string;
  rol: ValorRolAcceso;
};

import { type ValorRol } from "../../domain/types/Roles";

export type SessionClaims = {
  idUsuario: string;
  rol: ValorRol;
};

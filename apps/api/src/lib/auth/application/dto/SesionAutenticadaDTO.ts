import { type ValorRolAcceso } from "../../domain/value-objects/RolAcceso";

export type SesionAutenticadaDTO = {
  authToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    username: string;
    rol: ValorRolAcceso;
  };
};

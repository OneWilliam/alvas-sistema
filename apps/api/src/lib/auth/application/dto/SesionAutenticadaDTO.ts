import { type ValorRolUsuario } from "../../../usuarios";

export type SesionAutenticadaDTO = {
  authToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    rol: ValorRolUsuario;
  };
};

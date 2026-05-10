import { type ValorRolAcceso } from "../../domain/value-objects/RolAcceso";

export interface IAutenticadorDeUsuario {
  buscarPorId(id: string): Promise<{
    hashClave: string;
    rol: ValorRolAcceso;
    estaDeshabilitado: boolean;
  } | null>;
}

import { type IAutenticadorDeUsuario } from "../../application/ports/IAutenticadorDeUsuario";
import { type IUsuarioRepository } from "../../../usuarios/domain/ports";
import { IdUsuario } from "../../../usuarios/domain/value-objects";
import { type ValorRolAcceso } from "../../domain/value-objects/RolAcceso";

export class UsuarioAdapterParaAuth implements IAutenticadorDeUsuario {
  constructor(private readonly usuarioRepo: IUsuarioRepository) {}

  async buscarPorId(id: string): Promise<{
    hashClave: string;
    rol: ValorRolAcceso;
    estaDeshabilitado: boolean;
  } | null> {
    try {
      const idUsuario = new IdUsuario(id);
      const usuario = await this.usuarioRepo.obtenerPorId(idUsuario);

      if (!usuario) {
        return null;
      }

      return {
        hashClave: usuario.hashClave.valor,
        rol: usuario.rol.valor as ValorRolAcceso,
        estaDeshabilitado: usuario.estado.estaDeshabilitado(),
      };
    } catch {
      return null;
    }
  }
}

import { type UsuarioRespuestaDTO } from "../../application";
import { Usuario } from "../../domain/entities";
import { type UsuarioRow } from "./schema";

export class UsuarioMapper {
  static aDominio(row: UsuarioRow): Usuario {
    const nombre = row.nombre && row.nombre.trim() ? row.nombre : row.id;
    const username = row.username && row.username.trim() ? row.username : row.id.toLowerCase();
    const ahora = new Date().toISOString();
    const creadoEn = row.creadoEn || ahora;
    const actualizadoEn = row.actualizadoEn || ahora;

    return Usuario.reconstituir({
      id: row.id,
      username,
      nombre,
      hashClave: row.hashClave,
      rol: row.rol,
      estado: row.estado,
      creadoEn,
      actualizadoEn,
    });
  }

  static aPersistencia(usuario: Usuario) {
    return {
      id: usuario.id.valor,
      username: usuario.username.valor,
      nombre: usuario.nombre.valor,
      hashClave: usuario.hashClave.valor,
      rol: usuario.rol.valor,
      estado: usuario.estado.valor,
      creadoEn: usuario.creadoEn.toISOString(),
      actualizadoEn: usuario.actualizadoEn.toISOString(),
    };
  }

  static aRespuesta(usuario: Usuario): UsuarioRespuestaDTO {
    return {
      id: usuario.id.valor,
      username: usuario.username.valor,
      nombre: usuario.nombre.valor,
      rol: usuario.rol.valor,
      estado: usuario.estado.valor,
    };
  }
}

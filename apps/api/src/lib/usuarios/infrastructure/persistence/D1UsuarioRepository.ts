import { type D1DatabaseLike } from "../../../shared/infrastructure";
import { Usuario } from "../../domain/entities";
import { type IUsuarioRepository } from "../../application/ports";
import { EstadoUsuario, IdUsuario } from "../../domain/value-objects";
import { asegurarEsquemaUsuarios } from "./schema";
import { UsuarioMapper, type UsuarioPersistenciaRow } from "./UsuarioMapper";

export class D1UsuarioRepository implements IUsuarioRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  async obtenerPorId(id: IdUsuario): Promise<Usuario | null> {
    await asegurarEsquemaUsuarios(this.db);

    const row = await this.db
      .prepare(
        "SELECT id, nombre, hash_clave, rol, estado, creado_en, actualizado_en FROM usuarios WHERE id = ?1",
      )
      .bind(id.valor)
      .first<UsuarioPersistenciaRow>();

    if (!row) {
      return null;
    }

    return UsuarioMapper.aDominio(row);
  }

  async existePorId(id: IdUsuario): Promise<boolean> {
    await asegurarEsquemaUsuarios(this.db);

    const row = await this.db
      .prepare("SELECT id FROM usuarios WHERE id = ?1")
      .bind(id.valor)
      .first<{ id: string }>();

    return !!row;
  }

  async guardar(usuario: Usuario): Promise<void> {
    await asegurarEsquemaUsuarios(this.db);
    const usuarioPersistencia = UsuarioMapper.aPersistencia(usuario);

    await this.db
      .prepare(
        `
          INSERT INTO usuarios (id, nombre, hash_clave, rol, estado, creado_en, actualizado_en)
          VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
          ON CONFLICT(id) DO UPDATE SET
            nombre = excluded.nombre,
            hash_clave = excluded.hash_clave,
            rol = excluded.rol,
            estado = excluded.estado,
            actualizado_en = excluded.actualizado_en
        `,
      )
      .bind(
        usuarioPersistencia.id,
        usuarioPersistencia.nombre,
        usuarioPersistencia.hash_clave,
        usuarioPersistencia.rol,
        usuarioPersistencia.estado,
        usuarioPersistencia.creado_en,
        usuarioPersistencia.actualizado_en,
      )
      .run();
  }

  async eliminarPorId(id: IdUsuario): Promise<void> {
    await asegurarEsquemaUsuarios(this.db);
    await this.db.prepare("DELETE FROM usuarios WHERE id = ?1").bind(id.valor).run();
  }

  async listarTodos(): Promise<Usuario[]> {
    await asegurarEsquemaUsuarios(this.db);

    const query = await this.db
      .prepare(
        "SELECT id, nombre, hash_clave, rol, estado, creado_en, actualizado_en FROM usuarios ORDER BY id ASC",
      )
      .all<UsuarioPersistenciaRow>();

    return query.results.map((row: UsuarioPersistenciaRow) => UsuarioMapper.aDominio(row));
  }

  async deshabilitarPorId(id: IdUsuario): Promise<void> {
    const usuario = await this.obtenerPorId(id);

    if (!usuario) {
      return;
    }

    usuario.deshabilitar();
    await this.guardar(usuario);
  }

  async actualizarRol(id: IdUsuario, nuevoRol: string): Promise<void> {
    const usuario = await this.obtenerPorId(id);

    if (!usuario) {
      return;
    }

    usuario.cambiarRol(nuevoRol);
    await this.guardar(usuario);
  }

  async actualizarHashClave(id: IdUsuario, nuevoHash: string): Promise<void> {
    const usuario = await this.obtenerPorId(id);

    if (!usuario) {
      return;
    }

    usuario.cambiarHashClave(nuevoHash);
    await this.guardar(usuario);
  }

  async crearUsuario(id: string, nombre: string, hashClave: string, rol: string): Promise<Usuario> {
    const usuario = Usuario.crear({
      id,
      nombre,
      hashClave,
      rol,
      estado: EstadoUsuario.activo().valor,
    });

    await this.guardar(usuario);
    return usuario;
  }
}

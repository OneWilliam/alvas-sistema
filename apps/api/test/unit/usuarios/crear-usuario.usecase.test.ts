import { describe, expect, test } from "bun:test";

import { CrearUsuarioUseCase } from "../../../src/lib/usuarios/application/use-cases/CrearUsuarioUseCase";
import { Usuario } from "../../../src/lib/usuarios/domain/entities";
import {
  type IPasswordHasher,
  type IUsuarioRepository,
} from "../../../src/lib/usuarios/domain/ports";
import { HashClave, IdUsuario, Username } from "../../../src/lib/usuarios/domain/value-objects";

class FakeUsuarioRepository implements IUsuarioRepository {
  readonly usuarios = new Map<string, Usuario>();

  async obtenerPorId(id: IdUsuario): Promise<Usuario | null> {
    return this.usuarios.get(id.valor) ?? null;
  }

  async existePorId(id: IdUsuario): Promise<boolean> {
    return this.usuarios.has(id.valor);
  }

  async guardar(usuario: Usuario): Promise<void> {
    this.usuarios.set(usuario.id.valor, usuario);
  }

  async eliminarPorId(id: IdUsuario): Promise<void> {
    this.usuarios.delete(id.valor);
  }

  async listar(): Promise<Usuario[]> {
    return [...this.usuarios.values()];
  }

  async obtenerPorUsername(username: Username): Promise<Usuario | null> {
    return (
      [...this.usuarios.values()].find((usuario) => usuario.username.valor === username.valor) ??
      null
    );
  }

  async existePorUsername(username: Username): Promise<boolean> {
    return (await this.obtenerPorUsername(username)) !== null;
  }
}

class FakePasswordHasher implements IPasswordHasher {
  async hashear(): Promise<HashClave> {
    return new HashClave("hash-seguro-001");
  }

  async comparar(clavePlana: string, hashGuardado: string): Promise<boolean> {
    return clavePlana === "secreto" && hashGuardado === "hash-seguro-001";
  }
}

describe("usuarios / CrearUsuarioUseCase", () => {
  test("guarda usuario con hash generado", async () => {
    const repo = new FakeUsuarioRepository();
    const resultado = await new CrearUsuarioUseCase(repo, new FakePasswordHasher()).ejecutar({
      idUsuario: "user-001",
      username: "Asesor1",
      nombre: "Asesor Uno",
      clave: "secreto",
      rol: "ASESOR",
    });

    expect(resultado.esExito).toBe(true);
    expect(repo.usuarios.size).toBe(1);
    if (resultado.esExito) {
      expect(resultado.valor.username.valor).toBe("asesor1");
      expect(resultado.valor.hashClave.valor).toBe("hash-seguro-001");
    }
  });

  test("rechaza usernames duplicados", async () => {
    const repo = new FakeUsuarioRepository();
    const useCase = new CrearUsuarioUseCase(repo, new FakePasswordHasher());

    await useCase.ejecutar({
      idUsuario: "user-001",
      username: "asesor1",
      nombre: "Asesor Uno",
      clave: "secreto",
      rol: "ASESOR",
    });
    const duplicado = await useCase.ejecutar({
      idUsuario: "user-002",
      username: "asesor1",
      nombre: "Asesor Dos",
      clave: "secreto",
      rol: "ASESOR",
    });

    expect(duplicado.esExito).toBe(false);
  });
});

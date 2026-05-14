import { describe, expect, test } from "bun:test";

import { Usuario } from "../../../src/lib/usuarios/domain/entities";
import { UsuarioYaDeshabilitadoError } from "../../../src/lib/usuarios/domain/errors";

describe("usuarios / Usuario", () => {
  test("nace activo y protege deshabilitacion duplicada", () => {
    const usuario = Usuario.crear({
      id: "user-001",
      username: "asesor1",
      nombre: "Asesor Uno",
      hashClave: "hash-seguro-001",
      rol: "ASESOR",
    });

    expect(usuario.estado.valor).toBe("ACTIVO");

    usuario.deshabilitar();

    expect(usuario.estado.valor).toBe("DESHABILITADO");
    expect(() => usuario.deshabilitar()).toThrow(UsuarioYaDeshabilitadoError);
  });
});

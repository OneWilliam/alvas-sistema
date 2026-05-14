import { describe, expect, test } from "bun:test";

import { ErrorDeValidacion } from "../../../src/lib/shared/domain";
import {
  EstadoUsuarioInvalidoError,
  RolDeUsuarioInvalidoError,
} from "../../../src/lib/usuarios/domain/errors";
import {
  EstadoUsuario,
  Nombre,
  Rol,
  Username,
} from "../../../src/lib/usuarios/domain/value-objects";

describe("usuarios / value objects", () => {
  test("Username normaliza y valida formato", () => {
    expect(new Username("  Asesor.Uno  ").valor).toBe("asesor.uno");
    expect(() => new Username("ab")).toThrow(ErrorDeValidacion);
    expect(() => new Username("asesor uno")).toThrow(ErrorDeValidacion);
  });

  test("Nombre recorta espacios y rechaza valores vacios", () => {
    expect(new Nombre("  Maria Perez  ").valor).toBe("Maria Perez");
    expect(() => new Nombre("x")).toThrow(ErrorDeValidacion);
  });

  test("Rol y EstadoUsuario aceptan solo valores del lenguaje ubicuo", () => {
    const rol = new Rol(" admin ");
    const estado = EstadoUsuario.activo();

    expect(rol.valor).toBe("ADMIN");
    expect(rol.esAdmin()).toBe(true);
    expect(estado.estaActivo()).toBe(true);
    expect(() => new Rol("cliente")).toThrow(RolDeUsuarioInvalidoError);
    expect(() => new EstadoUsuario("bloqueado")).toThrow(EstadoUsuarioInvalidoError);
  });
});

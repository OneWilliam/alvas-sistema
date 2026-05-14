import { describe, expect, test } from "bun:test";

import { ErrorDeValidacion } from "../../../src/lib/shared/domain";
import {
  EstadoUsuarioInvalidoError,
  HashClaveUsuarioInvalidaError,
  IdUsuarioInvalidoError,
  RolDeUsuarioInvalidoError,
} from "../../../src/lib/usuarios/domain/errors";
import {
  EstadoUsuario,
  HashClave,
  IdUsuario,
  Nombre,
  Rol,
  Username,
} from "../../../src/lib/usuarios/domain/value-objects";

describe("usuarios / value objects", () => {
  test("Username normaliza y valida formato", () => {
    expect(new Username("  Asesor.Uno  ").valor).toBe("asesor.uno");
    expect(new Username("ABC").valor).toBe("abc");
    expect(new Username("A".repeat(50)).valor).toBe("a".repeat(50));
    expect(new Username("asesor_uno-1").toString()).toBe("asesor_uno-1");
    expect(() => new Username("ab")).toThrow("El username debe tener al menos 3 caracteres.");
    expect(() => new Username("A".repeat(51))).toThrow(
      "El username no puede exceder los 50 caracteres.",
    );
    expect(() => new Username("asesor uno")).toThrow(
      "El username solo puede contener letras, numeros, puntos, guiones y guion bajo.",
    );
    expect(() => new Username("asesor@uno")).toThrow(ErrorDeValidacion);
  });

  test("Nombre recorta espacios y rechaza valores vacios", () => {
    expect(new Nombre("  Maria Perez  ").valor).toBe("Maria Perez");
    expect(new Nombre("AB").valor).toBe("AB");
    expect(new Nombre("A".repeat(100)).toString()).toBe("A".repeat(100));
    expect(() => new Nombre("x")).toThrow("El nombre debe tener al menos 2 caracteres.");
    expect(() => new Nombre("A".repeat(101))).toThrow(
      "El nombre no puede exceder los 100 caracteres.",
    );
    expect(() => new Nombre(" ")).toThrow(ErrorDeValidacion);
  });

  test("IdUsuario normaliza, compara y protege longitudes invalidas", () => {
    const id = new IdUsuario("  user-1  ");
    const mismoId = new IdUsuario("user-1");
    const otroId = new IdUsuario("user-2");

    expect(id.valor).toBe("user-1");
    expect(id.toString()).toBe("user-1");
    expect(id.esIgual(mismoId)).toBe(true);
    expect(id.esIgual(otroId)).toBe(false);
    expect(new IdUsuario("abcde").valor).toBe("abcde");
    expect(() => new IdUsuario("abcd")).toThrow(IdUsuarioInvalidoError);
  });

  test("HashClave normaliza y protege hashes demasiado cortos", () => {
    expect(new HashClave("  1234567890  ").valor).toBe("1234567890");
    expect(new HashClave("a".repeat(10)).valor).toBe("a".repeat(10));
    expect(() => new HashClave("123456789")).toThrow(HashClaveUsuarioInvalidaError);
  });

  test("Rol y EstadoUsuario aceptan solo valores del lenguaje ubicuo", () => {
    const rol = new Rol(" admin ");
    const asesor = new Rol(" asesor ");
    const estado = EstadoUsuario.activo();
    const deshabilitado = EstadoUsuario.deshabilitado();

    expect(rol.valor).toBe("ADMIN");
    expect(rol.esAdmin()).toBe(true);
    expect(rol.esAsesor()).toBe(false);
    expect(asesor.valor).toBe("ASESOR");
    expect(asesor.esAdmin()).toBe(false);
    expect(asesor.esAsesor()).toBe(true);
    expect(estado.estaActivo()).toBe(true);
    expect(estado.estaDeshabilitado()).toBe(false);
    expect(new EstadoUsuario(" activo ").valor).toBe("ACTIVO");
    expect(deshabilitado.valor).toBe("DESHABILITADO");
    expect(deshabilitado.estaActivo()).toBe(false);
    expect(deshabilitado.estaDeshabilitado()).toBe(true);
    expect(() => new Rol("cliente")).toThrow(RolDeUsuarioInvalidoError);
    expect(() => new EstadoUsuario("bloqueado")).toThrow(EstadoUsuarioInvalidoError);
  });
});

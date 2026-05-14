import { describe, expect, test } from "bun:test";

import { AuthToken, RefreshToken } from "../../../src/lib/auth/domain/value-objects";
import {
  CanalCaptacion,
  OrigenCaptacion,
} from "../../../src/lib/integraciones/domain/value-objects";
import { DatosContactoCaptacion } from "../../../src/lib/integraciones/domain/value-objects/DatosContactoCaptacion";
import { PorcentajeConversion } from "../../../src/lib/reportes/domain/value-objects/PorcentajeConversion";
import { ErrorDeValidacion } from "../../../src/lib/shared/domain";
import {
  EstadoUsuario,
  Nombre,
  Rol,
  Username,
} from "../../../src/lib/usuarios/domain/value-objects";
import {
  EstadoUsuarioInvalidoError,
  RolDeUsuarioInvalidoError,
} from "../../../src/lib/usuarios/domain/errors";
import { RefreshTokenInvalidoError } from "../../../src/lib/auth/domain/errors";

describe("Value Objects de dominio", () => {
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

  test("Tokens de auth protegen valores obligatorios", () => {
    expect(new AuthToken(" token ").valor).toBe("token");
    expect(new RefreshToken(" refresh ").valor).toBe("refresh");
    expect(() => new AuthToken(" ")).toThrow(ErrorDeValidacion);
    expect(() => new RefreshToken(" ")).toThrow(RefreshTokenInvalidoError);
  });

  test("Captacion normaliza canal, origen y datos de contacto", () => {
    expect(new CanalCaptacion(" whatsapp ").valor).toBe("WHATSAPP");
    expect(new OrigenCaptacion("  Meta Ads  ").valor).toBe("Meta Ads");

    const contacto = DatosContactoCaptacion.crear({
      nombre: " Ana ",
      telefono: " 999 ",
      email: " ANA@EXAMPLE.COM ",
    });

    expect(contacto.nombre).toBe("Ana");
    expect(contacto.telefono).toBe("999");
    expect(contacto.email).toBe("ana@example.com");
    expect(() => new CanalCaptacion("sms")).toThrow(ErrorDeValidacion);
    expect(() => new OrigenCaptacion(" ")).toThrow(ErrorDeValidacion);
    expect(() => DatosContactoCaptacion.crear({ nombre: "", telefono: "999" })).toThrow(
      ErrorDeValidacion,
    );
  });

  test("PorcentajeConversion calcula y evita divisiones por cero", () => {
    expect(PorcentajeConversion.desdeLeadsYClientes(3, 12).valorNumerico).toBe(25);
    expect(PorcentajeConversion.desdeLeadsYClientes(2, 0).valorNumerico).toBe(200);
  });
});

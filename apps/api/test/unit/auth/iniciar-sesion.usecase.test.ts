import { describe, expect, test } from "bun:test";

import { IniciarSesionUseCase } from "../../../src/lib/auth/application/use-cases/IniciarSesionUseCase";
import {
  type CredencialesUsuario,
  type IConsultaCredencialesUsuario,
  type ITokenProvider,
  type IVerificadorDeClave,
} from "../../../src/lib/auth/domain/ports";
import { AuthToken, RefreshToken } from "../../../src/lib/auth/domain/value-objects";
import { type SessionClaims } from "../../../src/lib/shared/infrastructure/session";

class FakeConsultaCredenciales implements IConsultaCredencialesUsuario {
  constructor(private readonly usuario: CredencialesUsuario | null) {}

  async buscarPorId(): Promise<CredencialesUsuario | null> {
    return this.usuario;
  }

  async buscarPorUsername(username: string): Promise<CredencialesUsuario | null> {
    return this.usuario?.username === username ? this.usuario : null;
  }
}

class FakeVerificadorDeClave implements IVerificadorDeClave {
  constructor(private readonly coincide: boolean) {}

  async comparar(): Promise<boolean> {
    return this.coincide;
  }
}

class FakeTokenProvider implements ITokenProvider {
  generarAuthToken(): AuthToken {
    return new AuthToken("auth-token");
  }

  generarRefreshToken(): RefreshToken {
    return new RefreshToken("refresh-token");
  }

  validarAuthToken(): SessionClaims {
    return { idUsuario: "user-001", rol: "ASESOR" };
  }

  validarRefreshToken(): SessionClaims {
    return { idUsuario: "user-001", rol: "ASESOR" };
  }
}

describe("auth / IniciarSesionUseCase", () => {
  test("emite tokens para credenciales validas", async () => {
    const resultado = await new IniciarSesionUseCase(
      new FakeConsultaCredenciales({
        idUsuario: "user-001",
        username: "asesor1",
        hashClave: "hash-seguro-001",
        rol: "ASESOR",
        estado: "ACTIVO",
      }),
      new FakeVerificadorDeClave(true),
      new FakeTokenProvider(),
    ).ejecutar({ username: " Asesor1 ", clave: " secreto " });

    expect(resultado.esExito).toBe(true);
    if (resultado.esExito) {
      expect(resultado.valor.authToken).toBe("auth-token");
      expect(resultado.valor.usuario.username).toBe("asesor1");
    }
  });

  test("rechaza usuarios deshabilitados", async () => {
    const resultado = await new IniciarSesionUseCase(
      new FakeConsultaCredenciales({
        idUsuario: "user-001",
        username: "asesor1",
        hashClave: "hash-seguro-001",
        rol: "ASESOR",
        estado: "DESHABILITADO",
      }),
      new FakeVerificadorDeClave(true),
      new FakeTokenProvider(),
    ).ejecutar({ username: "asesor1", clave: "secreto" });

    expect(resultado.esExito).toBe(false);
  });
});

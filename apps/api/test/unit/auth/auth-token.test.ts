import { describe, expect, test } from "bun:test";

import {
  AuthTokenInvalidoError,
  CredencialesInvalidasError,
  RefreshTokenInvalidoError,
} from "../../../src/lib/auth/domain/errors";
import { AuthToken, RefreshToken } from "../../../src/lib/auth/domain/value-objects";
import { ErrorDeValidacion } from "../../../src/lib/shared/domain";

describe("auth / value objects", () => {
  test("AuthToken y RefreshToken protegen valores obligatorios", () => {
    expect(new AuthToken(" token ").valor).toBe("token");
    expect(new RefreshToken(" refresh ").valor).toBe("refresh");
    expect(() => new AuthToken(" ")).toThrow(ErrorDeValidacion);
    expect(() => new AuthToken(" ")).toThrow("El auth token no puede estar vacio.");
    expect(() => new RefreshToken(" ")).toThrow(RefreshTokenInvalidoError);
  });

  test("errores de auth exponen nombre, codigo y mensaje", () => {
    const authTokenError = new AuthTokenInvalidoError();
    const credencialesError = new CredencialesInvalidasError();
    const refreshTokenError = new RefreshTokenInvalidoError();

    expect(authTokenError.name).toBe("AuthTokenInvalidoError");
    expect(authTokenError.message).toBe("El auth token es invalido.");
    expect(authTokenError.codigo).toBe("AUTH_TOKEN_INVALIDO");

    expect(credencialesError.name).toBe("CredencialesInvalidasError");
    expect(credencialesError.message).toBe("Las credenciales son invalidas.");
    expect(credencialesError.codigo).toBe("CREDENCIALES_INVALIDAS");

    expect(refreshTokenError.name).toBe("RefreshTokenInvalidoError");
    expect(refreshTokenError.message).toBe("El refresh token es invalido.");
    expect(refreshTokenError.codigo).toBe("REFRESH_TOKEN_INVALIDO");
  });
});

import { describe, expect, test } from "bun:test";

import { Sesion } from "../../../src/lib/auth/domain";

describe("auth / Sesion", () => {
  test("expone tokens y usuario autenticado", () => {
    const sesion = Sesion.abrir({
      authToken: "auth-token",
      refreshToken: "refresh-token",
      idUsuario: "user-001",
      username: "asesor1",
      rol: "ASESOR",
    });

    expect(sesion.authToken).toBe("auth-token");
    expect(sesion.refreshToken).toBe("refresh-token");
    expect(sesion.idUsuario).toBe("user-001");
    expect(sesion.username).toBe("asesor1");
    expect(sesion.rol).toBe("ASESOR");
  });
});

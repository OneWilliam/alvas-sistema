import { describe, expect, test } from "bun:test";

import { RefreshTokenInvalidoError } from "../../../src/lib/auth/domain/errors";
import { AuthToken, RefreshToken } from "../../../src/lib/auth/domain/value-objects";
import { ErrorDeValidacion } from "../../../src/lib/shared/domain";

describe("auth / value objects", () => {
  test("AuthToken y RefreshToken protegen valores obligatorios", () => {
    expect(new AuthToken(" token ").valor).toBe("token");
    expect(new RefreshToken(" refresh ").valor).toBe("refresh");
    expect(() => new AuthToken(" ")).toThrow(ErrorDeValidacion);
    expect(() => new RefreshToken(" ")).toThrow(RefreshTokenInvalidoError);
  });
});

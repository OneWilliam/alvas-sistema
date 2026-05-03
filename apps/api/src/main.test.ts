import { describe, expect, it } from "bun:test";
import app from "./main";

describe("API base", () => {
  it("expone healthcheck", async () => {
    const response = await app.request("/health");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("alvas-api");
  });
});

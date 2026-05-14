import { describe, expect, test } from "bun:test";

import { Captacion } from "../../../src/lib/integraciones/domain/entities/Captacion";
import {
  CanalCaptacion,
  OrigenCaptacion,
} from "../../../src/lib/integraciones/domain/value-objects";
import { DatosContactoCaptacion } from "../../../src/lib/integraciones/domain/value-objects/DatosContactoCaptacion";
import { ErrorDeValidacion } from "../../../src/lib/shared/domain";

describe("integraciones / Captacion", () => {
  test("normaliza canal, origen y datos de contacto", () => {
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

  test("normaliza entrada y genera email local si falta correo", () => {
    const captacion = Captacion.registrar({
      canal: "whatsapp",
      origen: "campana mayo",
      nombre: "Luis",
      telefono: "999888777",
      tipo: "compra",
      metadata: { campania: "mayo" },
    });

    expect(captacion.canal.valor).toBe("WHATSAPP");
    expect(captacion.tipo).toBe("COMPRA");
    expect(captacion.emailDeContacto).toBe("999888777@contacto.whatsapp.local");
  });
});

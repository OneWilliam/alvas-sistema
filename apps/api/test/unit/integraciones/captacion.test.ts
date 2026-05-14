import { describe, expect, test } from "bun:test";

import { Captacion } from "../../../src/lib/integraciones/domain/entities/Captacion";
import { CaptacionWhatsApp } from "../../../src/lib/integraciones/domain/entities/CaptacionWhatsApp";
import {
  CanalCaptacion,
  OrigenCaptacion,
} from "../../../src/lib/integraciones/domain/value-objects";
import { DatosContactoCaptacion } from "../../../src/lib/integraciones/domain/value-objects/DatosContactoCaptacion";

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
    expect(() => new CanalCaptacion("sms")).toThrow("Canal de captacion no soportado.");
    expect(() => new OrigenCaptacion(" ")).toThrow("El origen de captacion es obligatorio.");
    expect(() => DatosContactoCaptacion.crear({ nombre: "", telefono: "999" })).toThrow(
      "El nombre de contacto es obligatorio.",
    );
    expect(() => DatosContactoCaptacion.crear({ nombre: "Ana", telefono: " " })).toThrow(
      "El telefono de contacto es obligatorio.",
    );
  });

  test("normaliza entrada y genera email local si falta correo", () => {
    const captacion = Captacion.registrar({
      canal: "whatsapp",
      origen: "campana mayo",
      nombre: "Luis",
      telefono: "999888777",
      tipo: " compra ",
      idPropiedadInteres: "  prop-123  ",
      metadata: { campania: "mayo" },
    });

    expect(captacion.canal.valor).toBe("WHATSAPP");
    expect(captacion.origen.valor).toBe("campana mayo");
    expect(captacion.contacto.nombre).toBe("Luis");
    expect(captacion.contacto.telefono).toBe("999888777");
    expect(captacion.tipo).toBe("COMPRA");
    expect(captacion.idPropiedadInteres).toBe("prop-123");
    expect(captacion.metadata).toEqual({ campania: "mayo" });
    expect(captacion.emailDeContacto).toBe("999888777@contacto.whatsapp.local");

    const captacionSinPropiedad = Captacion.registrar({
      canal: "whatsapp",
      origen: "campana mayo",
      nombre: "Luis",
      telefono: "999888777",
      tipo: "captacion",
    });

    expect(captacionSinPropiedad.idPropiedadInteres).toBeUndefined();
  });

  test("normaliza webhooks de WhatsApp y los convierte en captacion", () => {
    const webhook = CaptacionWhatsApp.crear({
      wa_id: "  573001112233  ",
      wa_name: "  Laura  ",
      pregunta_tipo: " venta ",
      propiedad_id: "  prop-456 ",
    });

    expect(webhook.telefono).toBe("573001112233");
    expect(webhook.nombre).toBe("Laura");
    expect(webhook.tipo).toBe("VENTA");
    expect(webhook.idPropiedadInteres).toBe("prop-456");
    expect(webhook.emailDeContactoProvisional).toBe("573001112233@contacto.whatsapp.local");

    const captacion = webhook.aCaptacion();

    expect(captacion.canal.valor).toBe("WHATSAPP");
    expect(captacion.origen.valor).toBe("whatsapp_webhook");
    expect(captacion.contacto.nombre).toBe("Laura");
    expect(captacion.contacto.telefono).toBe("573001112233");
    expect(captacion.emailDeContacto).toBe("573001112233@contacto.whatsapp.local");
    expect(captacion.tipo).toBe("VENTA");
    expect(captacion.idPropiedadInteres).toBe("prop-456");
    expect(captacion.metadata).toEqual({ canal: "whatsapp" });
  });

  test("webhook de WhatsApp usa valores por defecto y valida datos obligatorios", () => {
    const webhook = CaptacionWhatsApp.crear({
      wa_id: "573001112233",
      wa_name: "Laura",
    });

    expect(webhook.tipo).toBe("CAPTACION");
    expect(webhook.idPropiedadInteres).toBeUndefined();
    expect(() => CaptacionWhatsApp.crear({ wa_id: " ", wa_name: "Laura" })).toThrow(
      "El webhook de WhatsApp requiere wa_id.",
    );
    expect(() => CaptacionWhatsApp.crear({ wa_id: "573001112233", wa_name: " " })).toThrow(
      "El webhook de WhatsApp requiere wa_name.",
    );
  });
});

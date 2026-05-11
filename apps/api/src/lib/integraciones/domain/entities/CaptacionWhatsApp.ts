import { ErrorDeValidacion } from "../../../shared/domain";
import { Captacion } from "./Captacion";

type CaptacionWhatsAppProps = Readonly<{
  telefono: string;
  nombre: string;
  tipo: string;
  idPropiedadInteres?: string;
}>;

export class CaptacionWhatsApp {
  private constructor(private readonly props: CaptacionWhatsAppProps) {}

  static crear(input: {
    wa_id: string;
    wa_name: string;
    pregunta_tipo?: string;
    propiedad_id?: string;
  }): CaptacionWhatsApp {
    const telefono = input.wa_id.trim();
    const nombre = input.wa_name.trim();

    if (!telefono) {
      throw new ErrorDeValidacion("El webhook de WhatsApp requiere wa_id.");
    }

    if (!nombre) {
      throw new ErrorDeValidacion("El webhook de WhatsApp requiere wa_name.");
    }

    return new CaptacionWhatsApp({
      telefono,
      nombre,
      tipo: input.pregunta_tipo?.trim().toUpperCase() || "CAPTACION",
      idPropiedadInteres: input.propiedad_id?.trim() || undefined,
    });
  }

  get telefono(): string {
    return this.props.telefono;
  }

  get nombre(): string {
    return this.props.nombre;
  }

  get tipo(): string {
    return this.props.tipo;
  }

  get idPropiedadInteres(): string | undefined {
    return this.props.idPropiedadInteres;
  }

  get emailDeContactoProvisional(): string {
    return `${this.props.telefono}@contacto.whatsapp.local`;
  }

  aCaptacion(): Captacion {
    return Captacion.registrar({
      canal: "WHATSAPP",
      origen: "whatsapp_webhook",
      nombre: this.nombre,
      telefono: this.telefono,
      email: this.emailDeContactoProvisional,
      tipo: this.tipo,
      idPropiedadInteres: this.idPropiedadInteres,
      metadata: {
        canal: "whatsapp",
      },
    });
  }
}

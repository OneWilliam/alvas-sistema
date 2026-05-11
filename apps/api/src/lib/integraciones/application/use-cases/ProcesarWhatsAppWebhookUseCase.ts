import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { CaptacionWhatsApp } from "../../domain";
import { type IRegistroLeadCaptacion } from "../../domain/ports/IRegistroLeadCaptacion";

export type EntradaWhatsAppWebhook = Readonly<{
  wa_id: string;
  wa_name: string;
  pregunta_tipo?: string;
  propiedad_id?: string;
}>;

export type SalidaWhatsAppWebhook = Readonly<{
  idLead: string;
}>;

export class ProcesarWhatsAppWebhookUseCase implements CasoDeUso<
  EntradaWhatsAppWebhook,
  Resultado<SalidaWhatsAppWebhook, ErrorDeDominio>
> {
  constructor(private readonly registroLead: IRegistroLeadCaptacion) {}

  async ejecutar(
    input: EntradaWhatsAppWebhook,
  ): Promise<Resultado<SalidaWhatsAppWebhook, ErrorDeDominio>> {
    try {
      const captacion = CaptacionWhatsApp.crear(input);
      const resultado = await this.registroLead.registrar({
        nombre: captacion.nombre,
        email: captacion.emailDeContactoProvisional,
        telefono: captacion.telefono,
        tipo: captacion.tipo,
        idPropiedadInteres: captacion.idPropiedadInteres,
      });

      if (!resultado.esExito) {
        return resultadoFallido(resultado.error);
      }

      return resultadoExitoso({ idLead: resultado.valor.id });
    } catch (error) {
      if (error instanceof ErrorDeDominio) {
        return resultadoFallido(error);
      }

      throw error;
    }
  }
}

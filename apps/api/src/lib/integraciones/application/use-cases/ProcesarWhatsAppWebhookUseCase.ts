import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { CaptacionWhatsApp } from "../../domain";
import { type IRegistroLeadCaptacion } from "../../domain/ports/IRegistroLeadCaptacion";
import { type EntradaWhatsAppWebhookDTO, type CaptacionProcesadaDTO } from "../dto/CaptacionDTOs";
import { type IProcesarWhatsAppWebhook } from "../ports/in";

export class ProcesarWhatsAppWebhookUseCase implements CasoDeUso<
  EntradaWhatsAppWebhookDTO,
  Resultado<CaptacionProcesadaDTO, ErrorDeDominio>
>,
  IProcesarWhatsAppWebhook
{
  constructor(private readonly registroLead: IRegistroLeadCaptacion) {}

  async ejecutar(
    input: EntradaWhatsAppWebhookDTO,
  ): Promise<Resultado<CaptacionProcesadaDTO, ErrorDeDominio>> {
    try {
      const captacion = CaptacionWhatsApp.crear(input).aCaptacion();
      const resultado = await this.registroLead.registrar({
        canal: captacion.canal.valor,
        origen: captacion.origen.valor,
        nombre: captacion.contacto.nombre,
        email: captacion.emailDeContacto,
        telefono: captacion.contacto.telefono,
        tipo: captacion.tipo,
        idPropiedadInteres: captacion.idPropiedadInteres,
        metadata: captacion.metadata,
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

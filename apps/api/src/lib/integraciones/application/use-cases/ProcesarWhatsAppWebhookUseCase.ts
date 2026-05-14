import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { CaptacionWhatsApp } from "../../domain";
import { type IRegistroLeadCaptacion } from "../../domain/ports/IRegistroLeadCaptacion";
import { type IRegistroPropiedadCaptacion } from "../../domain/ports/IRegistroPropiedadCaptacion";
import { type EntradaWhatsAppWebhookDTO, type CaptacionProcesadaDTO } from "../dto/CaptacionDTOs";
import { type IProcesarWhatsAppWebhook } from "../ports/in";

export class ProcesarWhatsAppWebhookUseCase
  implements
    CasoDeUso<EntradaWhatsAppWebhookDTO, Resultado<CaptacionProcesadaDTO, ErrorDeDominio>>,
    IProcesarWhatsAppWebhook
{
  constructor(
    private readonly registroLead: IRegistroLeadCaptacion,
    private readonly registroPropiedad?: IRegistroPropiedadCaptacion,
  ) {}

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

      let idPropiedadPreliminar: string | undefined;
      if (captacion.tipo === "VENTA" && this.registroPropiedad) {
        const propiedad = await this.registroPropiedad.registrar({
          idLeadOrigen: resultado.valor.id,
          asesorCaptadorId: resultado.valor.idAsesor,
          nombreContacto: captacion.contacto.nombre,
          origen: captacion.origen.valor,
          metadata: captacion.metadata,
        });

        if (!propiedad.esExito) {
          return resultadoFallido(propiedad.error);
        }

        idPropiedadPreliminar = propiedad.valor.id;
      }

      return resultadoExitoso({ idLead: resultado.valor.id, idPropiedadPreliminar });
    } catch (error) {
      if (error instanceof ErrorDeDominio) {
        return resultadoFallido(error);
      }

      throw error;
    }
  }
}

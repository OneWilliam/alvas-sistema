import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import {
  type CaptacionProcesadaDTO,
  type EntradaWhatsAppWebhookDTO,
} from "../../dto/CaptacionDTOs";

export interface IProcesarWhatsAppWebhook {
  ejecutar(
    input: EntradaWhatsAppWebhookDTO,
  ): Promise<Resultado<CaptacionProcesadaDTO, ErrorDeDominio>>;
}

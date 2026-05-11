import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type CaptacionEntranteDTO, type CaptacionProcesadaDTO } from "../../dto/CaptacionDTOs";

export interface IProcesarCaptacionEntrante {
  ejecutar(
    input: CaptacionEntranteDTO,
  ): Promise<Resultado<CaptacionProcesadaDTO, ErrorDeDominio>>;
}

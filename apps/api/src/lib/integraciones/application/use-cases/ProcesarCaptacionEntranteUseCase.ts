import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { Captacion } from "../../domain";
import { type IRegistroLeadCaptacion } from "../../domain/ports/IRegistroLeadCaptacion";
import {
  type CaptacionEntranteDTO,
  type CaptacionProcesadaDTO,
} from "../dto/CaptacionDTOs";
import { type IProcesarCaptacionEntrante } from "../ports/in";

export class ProcesarCaptacionEntranteUseCase
  implements
    CasoDeUso<CaptacionEntranteDTO, Resultado<CaptacionProcesadaDTO, ErrorDeDominio>>,
    IProcesarCaptacionEntrante
{
  constructor(private readonly registroLead: IRegistroLeadCaptacion) {}

  async ejecutar(
    input: CaptacionEntranteDTO,
  ): Promise<Resultado<CaptacionProcesadaDTO, ErrorDeDominio>> {
    try {
      const captacion = Captacion.registrar(input);
      const resultado = await this.registroLead.registrar({
        canal: captacion.canal.valor,
        origen: captacion.origen.valor,
        nombre: captacion.contacto.nombre,
        email: captacion.contacto.email ?? captacion.emailDeContacto,
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

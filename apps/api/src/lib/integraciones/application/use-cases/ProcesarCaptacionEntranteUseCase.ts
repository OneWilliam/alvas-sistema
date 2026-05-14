import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { Captacion } from "../../domain";
import { type IRegistroLeadCaptacion } from "../../domain/ports/IRegistroLeadCaptacion";
import { type IRegistroPropiedadCaptacion } from "../../domain/ports/IRegistroPropiedadCaptacion";
import { type CaptacionEntranteDTO, type CaptacionProcesadaDTO } from "../dto/CaptacionDTOs";
import { type IProcesarCaptacionEntrante } from "../ports/in";

export class ProcesarCaptacionEntranteUseCase
  implements
    CasoDeUso<CaptacionEntranteDTO, Resultado<CaptacionProcesadaDTO, ErrorDeDominio>>,
    IProcesarCaptacionEntrante
{
  constructor(
    private readonly registroLead: IRegistroLeadCaptacion,
    private readonly registroPropiedad?: IRegistroPropiedadCaptacion,
  ) {}

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

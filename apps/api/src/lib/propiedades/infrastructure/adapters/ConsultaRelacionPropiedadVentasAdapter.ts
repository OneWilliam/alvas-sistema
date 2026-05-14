import { type IVentasRepository } from "../../../ventas/domain/ports/IVentasRepository";
import { idCliente, idLead } from "../../../ventas/domain/value-objects";
import { type IConsultaRelacionPropiedad, type RelacionPropiedad } from "../../domain/ports";

export class ConsultaRelacionPropiedadVentasAdapter implements IConsultaRelacionPropiedad {
  constructor(private readonly ventasRepository: IVentasRepository) {}

  async asesorGestionaPropiedad(idAsesor: string, relacion: RelacionPropiedad): Promise<boolean> {
    if (relacion.idLeadOrigen) {
      const lead = await this.ventasRepository.obtenerLeadPorId(idLead(relacion.idLeadOrigen));
      if ((lead?.idAsesor as string | undefined) === idAsesor) {
        return true;
      }
    }

    if (relacion.idClientePropietario) {
      const cliente = await this.ventasRepository.obtenerClientePorId(
        idCliente(relacion.idClientePropietario),
      );
      if ((cliente?.idAsesor as string | undefined) === idAsesor) {
        return true;
      }
    }

    return false;
  }
}

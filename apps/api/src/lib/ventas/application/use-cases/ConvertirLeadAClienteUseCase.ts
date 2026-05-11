import {
  type CasoDeUso,
  resultadoExitoso,
  resultadoFallido,
  type Resultado,
} from "../../../shared";
import { ErrorDeDominio } from "../../../shared/domain";
import { type IVentasRepository } from "../../domain/ports/IVentasRepository";
import { Cliente } from "../../domain/entities/Cliente";
import { idLead, idCliente } from "../../domain/value-objects/Ids";
import { type IGeneradorId } from "../../../shared/domain/ports/IGeneradorId";
import { type IConvertirLeadACliente } from "../ports/in";

export type ConvertirLeadAClienteInput = {
  idLead: string;
};

export class ConvertirLeadAClienteUseCase implements CasoDeUso<
  ConvertirLeadAClienteInput,
  Resultado<Cliente, ErrorDeDominio>
>,
  IConvertirLeadACliente
{
  constructor(
    private readonly repository: IVentasRepository,
    private readonly generadorId: IGeneradorId,
  ) {}

  async ejecutar(input: ConvertirLeadAClienteInput): Promise<Resultado<Cliente, ErrorDeDominio>> {
    try {
      const lead = await this.repository.obtenerLeadPorId(idLead(input.idLead));
      if (!lead)
        return resultadoFallido(
          new ErrorDeDominio("Lead no encontrado", { codigo: "LEAD_NO_ENCONTRADO" }),
        );

      const nuevoIdCliente = idCliente(this.generadorId.generar());

      const cliente = Cliente.crear({
        id: nuevoIdCliente as string,
        nombre: lead.nombre,
        email: lead.email,
        telefono: lead.telefono,
        idAsesor: lead.idAsesor,
        idLeadOrigen: lead.id,
      });

      lead.convertirACliente(nuevoIdCliente);

      await this.repository.guardarCliente(cliente);
      await this.repository.guardarLead(lead);
      await this.repository.registrarActividad(
        lead.id,
        "CONVERTIDO_A_CLIENTE",
        `Lead convertido a cliente con ID ${nuevoIdCliente}`,
      );

      return resultadoExitoso(cliente);
    } catch (error) {
      if (error instanceof ErrorDeDominio) return resultadoFallido(error);
      throw error;
    }
  }
}

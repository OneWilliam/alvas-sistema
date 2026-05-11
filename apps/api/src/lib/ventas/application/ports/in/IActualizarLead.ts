import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type ActualizarLeadInput } from "../../use-cases/ActualizarLeadUseCase";

export interface IActualizarLead {
  ejecutar(input: ActualizarLeadInput): Promise<Resultado<void, ErrorDeDominio>>;
}

import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Lead } from "../../../domain/entities/Lead";
import { type RegistrarLeadInput } from "../../use-cases/RegistrarLeadUseCase";

export interface IRegistrarLead {
  ejecutar(input: RegistrarLeadInput): Promise<Resultado<Lead, ErrorDeDominio>>;
}

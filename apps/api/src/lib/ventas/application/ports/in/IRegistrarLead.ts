import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Lead } from "../../../domain/entities/Lead";
import { type RegistrarLeadInputDTO } from "../../dto/LeadDTOs";

export interface IRegistrarLead {
  ejecutar(input: RegistrarLeadInputDTO): Promise<Resultado<Lead, ErrorDeDominio>>;
}

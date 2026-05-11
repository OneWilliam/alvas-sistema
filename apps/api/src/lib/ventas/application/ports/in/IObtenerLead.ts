import { type Resultado } from "../../../../shared";
import { type ErrorDeDominio } from "../../../../shared/domain";
import { type Lead } from "../../../domain/entities/Lead";
import { type ObtenerLeadInputDTO } from "../../dto/LeadDTOs";

export interface IObtenerLead {
  ejecutar(input: ObtenerLeadInputDTO): Promise<Resultado<Lead, ErrorDeDominio>>;
}

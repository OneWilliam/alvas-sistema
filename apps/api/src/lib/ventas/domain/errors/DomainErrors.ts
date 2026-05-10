import { ErrorDeDominio } from "../../../shared/domain/errors/ErrorDeDominio";

export class LeadNoEncontradoError extends ErrorDeDominio {
  constructor(id: string) {
    super(`El lead con id ${id} no ha sido encontrado.`);
  }
}

export class LeadYaConvertidoError extends ErrorDeDominio {
  constructor(id: string) {
    super(`El lead con id ${id} ya ha sido convertido a cliente.`);
  }
}

export class ContratoNoEncontradoError extends ErrorDeDominio {
  constructor(id: string) {
    super(`El contrato con id ${id} no ha sido encontrado.`);
  }
}

export class ClienteNoEncontradoError extends ErrorDeDominio {
  constructor(id: string) {
    super(`El cliente con id ${id} no ha sido encontrado.`);
  }
}

export class CitaNoEncontradaError extends ErrorDeDominio {
  constructor(id: string) {
    super(`La cita con id ${id} no ha sido encontrada.`);
  }
}

export type CaptacionEntranteDTO = Readonly<{
  canal: string;
  origen: string;
  nombre: string;
  telefono: string;
  email?: string;
  tipo: string;
  idPropiedadInteres?: string;
  metadata?: Readonly<Record<string, string>>;
}>;

export type EntradaWhatsAppWebhookDTO = Readonly<{
  wa_id: string;
  wa_name: string;
  pregunta_tipo?: string;
  propiedad_id?: string;
}>;

export type CaptacionProcesadaDTO = Readonly<{
  idLead: string;
}>;

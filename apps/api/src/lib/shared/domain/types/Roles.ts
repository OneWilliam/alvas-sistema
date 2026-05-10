export const ROLES_SISTEMA = ["ADMIN", "ASESOR"] as const;
export type ValorRol = (typeof ROLES_SISTEMA)[number];

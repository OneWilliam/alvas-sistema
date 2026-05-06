export const ROLES_ACCESO = ["ADMIN", "ASESOR"] as const;
export type ValorRolAcceso = (typeof ROLES_ACCESO)[number];

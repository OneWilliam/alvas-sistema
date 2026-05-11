export type D1RunResultLike = {
  success?: boolean;
};

export type D1AllResultLike<TRow> = {
  results: TRow[];
};

export interface D1StatementLike {
  bind(...values: unknown[]): D1StatementLike;
  first<TRow = unknown>(): Promise<TRow | null>;
  run(): Promise<D1RunResultLike>;
  all<TRow = unknown>(): Promise<D1AllResultLike<TRow>>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1StatementLike;
  exec(query: string): Promise<unknown>;
  /** Lote atómico (p. ej. statements generados por Drizzle para D1). */
  batch?(statements: unknown[]): Promise<unknown[]>;
}

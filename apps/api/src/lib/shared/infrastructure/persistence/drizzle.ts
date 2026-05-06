import { drizzle } from "drizzle-orm/d1";
import { type D1DatabaseLike } from "../index";

let dbInstance: ReturnType<typeof drizzle> | null = null;

export const obtenerDb = (d1: D1DatabaseLike) => {
  if (!dbInstance) {
    dbInstance = drizzle(d1);
  }
  return dbInstance;
};

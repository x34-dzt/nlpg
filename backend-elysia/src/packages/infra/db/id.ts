import { ulid } from "ulid";

export const type = {
  user: "usr",
  databaseConfig: "dbcfg",
  conversation: "conn",
  message: "msg",
} as const;

export const createId = (idType: keyof typeof type) =>
  [type[idType], ulid()].join("_");

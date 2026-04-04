import { ulid } from "ulid";

export const type = {
  user: "usr",
  connection: "cnct",
  conversation: "conn",
  message: "msg",
  widget: "wdgt",
  share: "shr",
} as const;

export const createId = (idType: keyof typeof type) =>
  [type[idType], ulid()].join("_");

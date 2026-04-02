import type { MessageModel } from "../../../infra/database/models";

export type MessageResponseDto = Omit<MessageModel, "deletedAt">;

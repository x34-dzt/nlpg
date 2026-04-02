import { IsString } from "class-validator";
import type { ConversationModel } from "../../../infra/database/models";

export class CreateConversationDto {
  @IsString()
  databaseConfigId: string;
}

export type ConversationResponseDto = Omit<ConversationModel, "deletedAt">;

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { ChatRepo } from "./chat.repo";
import { DatabaseConfigRepo } from "../database-config/database-config.repo";
import {
  CreateConversationDto,
  ConversationResponseDto,
} from "./dto/create-conversation.dto";
import { MessageResponseDto } from "./dto/message.dto";
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from "../database-config/dto/pagination.dto";

const DEFAULT_LIMIT = 50;

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepo: ChatRepo,
    private readonly databaseConfigRepo: DatabaseConfigRepo,
  ) {}

  async createConversation(
    dto: CreateConversationDto,
    userId: string,
  ): Promise<ConversationResponseDto> {
    const configs = await this.databaseConfigRepo.findManyByUserId(
      userId,
      undefined,
      1,
    );
    const config = configs.find((c) => c.id === dto.databaseConfigId);
    if (!config) {
      throw new ForbiddenException("Database config does not belong to you");
    }

    const conversation = await this.chatRepo.createConversation(dto, userId);
    const { deletedAt, ...response } = conversation;
    return response;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<MessageResponseDto>> {
    const conversation =
      await this.chatRepo.findConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }
    if (conversation.createdBy !== userId) {
      throw new ForbiddenException("Conversation does not belong to you");
    }

    const limit = query.limit ?? DEFAULT_LIMIT;
    const results = await this.chatRepo.findMessages(
      conversationId,
      query.cursor,
      limit,
    );

    const hasNext = results.length > limit;
    const items = hasNext ? results.slice(0, limit) : results;

    const stripped = items.map(({ deletedAt, ...rest }) => rest);

    return {
      items: stripped,
      nextCursor: hasNext ? items[items.length - 1].id : null,
      hasNext,
    };
  }
}

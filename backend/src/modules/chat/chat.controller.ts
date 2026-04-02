import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Request,
  UseGuards,
} from "@nestjs/common";
import type { Request as ExpressRequest } from "express";
import { AuthGuard } from "../auth/auth.guard";
import type { JwtPayload } from "../auth/types/jwt-payload.type";
import { ChatService } from "./chat.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { PaginationQueryDto } from "../database-config/dto/pagination.dto";

@Controller("conversations")
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async create(
    @Body() dto: CreateConversationDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req["user"] as JwtPayload;
    return this.chatService.createConversation(dto, user.sub);
  }

  @Get(":conversationId/messages")
  async getMessages(
    @Param("conversationId") conversationId: string,
    @Query() query: PaginationQueryDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req["user"] as JwtPayload;
    return this.chatService.getMessages(conversationId, user.sub, query);
  }
}

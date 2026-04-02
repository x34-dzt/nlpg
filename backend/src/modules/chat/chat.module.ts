import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infra/database/database.module";
import { AuthModule } from "../auth/auth.module";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { ChatRepo } from "./chat.repo";
import { DatabaseConfigRepo } from "../database-config/database-config.repo";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ChatController],
  providers: [ChatService, ChatRepo, DatabaseConfigRepo],
})
export class ChatModule {}

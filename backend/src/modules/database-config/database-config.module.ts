import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infra/database/database.module";
import { AuthModule } from "../auth/auth.module";
import { DatabaseConfigController } from "./database-config.controller";
import { DatabaseConfigService } from "./database-config.service";
import { DatabaseConfigRepo } from "./database-config.repo";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [DatabaseConfigController],
  providers: [DatabaseConfigService, DatabaseConfigRepo],
})
export class DatabaseConfigModule {}

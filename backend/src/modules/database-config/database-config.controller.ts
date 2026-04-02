import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import type { Request as ExpressRequest } from "express";
import { AuthGuard } from "../auth/auth.guard";
import type { JwtPayload } from "../auth/types/jwt-payload.type";
import { DatabaseConfigService } from "./database-config.service";
import { CreateDatabaseConfigDto } from "./dto/create-database-config.dto";
import { PaginationQueryDto } from "./dto/pagination.dto";

@Controller("database-config")
@UseGuards(AuthGuard)
export class DatabaseConfigController {
  constructor(private readonly databaseConfigService: DatabaseConfigService) {}

  @Post()
  async create(
    @Body() dto: CreateDatabaseConfigDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req["user"] as JwtPayload;
    return this.databaseConfigService.create(dto, user.sub);
  }

  @Get()
  async findAll(
    @Query() query: PaginationQueryDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req["user"] as JwtPayload;
    return this.databaseConfigService.findAll(user.sub, query);
  }
}

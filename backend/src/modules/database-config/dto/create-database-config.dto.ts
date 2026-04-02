import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
} from "class-validator";
import { DatabaseConfigModel } from "../../../infra/database/models";

export class CreateDatabaseConfigDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  host: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  port?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  database: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  username: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  password: string;

  @IsOptional()
  @IsBoolean()
  ssl?: boolean;
}

export type DatabaseConfigResponseDto = Omit<
  DatabaseConfigModel,
  "password" | "deletedAt"
>;

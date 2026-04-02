import { IsOptional, IsNumber, Min, Max, IsString } from "class-validator";
import { Type } from "class-transformer";

export class PaginationQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;
}

export class PaginatedResponseDto<T> {
  items: T[];
  nextCursor: string | null;
  hasNext: boolean;
}

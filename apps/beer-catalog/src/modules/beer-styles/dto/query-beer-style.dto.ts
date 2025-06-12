import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'libs/common';

export class QueryBeerStyleDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter beer styles by name (partial search)',
    example: 'ale',
  })
  @IsString()
  @IsOptional()
  name?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../pagination-query.dto';

export class QueryBeerStyleDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter beer styles by name (partial search)',
    example: 'ale',
  })
  @IsString()
  @IsOptional()
  name?: string;
}

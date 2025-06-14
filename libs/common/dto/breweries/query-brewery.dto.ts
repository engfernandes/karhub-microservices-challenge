import { PaginationQueryDto } from '../pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryBreweryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'The name of the brewery. Example: "Brewery Name"',
    type: String,
  })
  @IsString()
  @IsOptional()
  name?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../pagination-query.dto';

export class QueryBeerDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'The name of the beer. Example: "Pale Ale"',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description:
      'The alcohol by volume (ABV) percentage of the beer. Example: 5.0',
  })
  @IsOptional()
  abv?: number;

  @ApiPropertyOptional({
    description: 'Minimum ABV percentage of the beer. Example: 4.0',
    type: Number,
  })
  @IsOptional()
  minAbv?: number;

  @ApiPropertyOptional({
    description: 'Maximum ABV percentage of the beer. Example: 8.0',
  })
  @IsOptional()
  maxAbv?: number;

  @ApiPropertyOptional({
    description: 'The ID of the beer style. Example: 1',
  })
  @IsOptional()
  styleId?: number;

  @ApiPropertyOptional({
    description: 'The ID of the brewery that produces the beer. Example: 1',
  })
  @IsOptional()
  breweryId?: number;
}

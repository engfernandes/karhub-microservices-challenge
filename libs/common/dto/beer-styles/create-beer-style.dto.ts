import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBeerStyleDto {
  @ApiProperty({
    description: 'The name of the beer style.',
    example: 'India Pale Ale',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description:
      'The ideal minimum temperature for consumption, in degrees Celsius.',
    example: -7.0,
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @IsOptional()
  minTemperature?: number;

  @ApiProperty({
    description:
      'The ideal maximum temperature for consumption, in degrees Celsius.',
    example: 10.0,
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @IsOptional()
  maxTemperature?: number;

  @ApiProperty({
    description:
      'The average temperature for the beer style, in degrees Celsius.',
    example: 3.0,
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @IsOptional()
  averageTemperature?: number;

  @ApiProperty({
    description: 'A brief description of the beer style.',
    example: 'A pale and frothy beer style with a high level of hops.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

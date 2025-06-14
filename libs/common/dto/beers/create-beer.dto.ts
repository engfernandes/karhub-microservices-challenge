import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBeerDto {
  @ApiProperty({
    description: 'The name of the beer.',
    example: 'Stella Artois',
  })
  @IsString()
  @MaxLength(255)
  @MinLength(2)
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The alcohol by volume (ABV) percentage of the beer.',
    example: 5.2,
    type: Number,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @IsNotEmpty()
  abv: number;

  @ApiProperty({
    description: 'The ID of the beer style.',
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsNotEmpty()
  styleId: number;

  @ApiProperty({
    description: 'The ID of the brewery that produces the beer.',
    example: 1,
    type: Number,
  })
  @IsInt()
  @IsNotEmpty()
  breweryId: number;
}

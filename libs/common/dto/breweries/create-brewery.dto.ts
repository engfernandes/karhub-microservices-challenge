import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBreweryDto {
  @ApiProperty({
    description: 'The name of the brewery',
    example: 'Brewery Name',
    type: String,
    required: true,
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @IsNotEmpty()
  name: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetBeerPairingDto {
  @ApiProperty({
    description: 'Temperature in Celsius to get beer recommendations',
    example: 5,
  })
  @IsNumber()
  @Type(() => Number)
  temperature: number;
}

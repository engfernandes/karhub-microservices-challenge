import { ApiProperty } from '@nestjs/swagger';
import { BeerStyle } from '@prisma/client';

export class BeerStyleEntity {
  @ApiProperty({ description: 'The unique ID of the beer style' })
  id: number;

  @ApiProperty({ description: 'The name of the beer style' })
  name: string;

  @ApiProperty({
    description: 'The minimum ideal temperature for consumption',
    type: 'number',
    format: 'decimal',
    required: false,
    nullable: true,
  })
  minTemperature: number | null;

  @ApiProperty({
    description: 'The maximum ideal temperature for consumption',
    type: 'number',
    format: 'decimal',
    required: false,
    nullable: true,
  })
  maxTemperature: number | null;

  @ApiProperty({
    description: 'The average temperature for the beer style',
    type: 'number',
    format: 'decimal',
    required: false,
    nullable: true,
  })
  averageTemperature: number | null;

  @ApiProperty({
    description: 'A brief description about the style',
    required: false,
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ description: 'The date the record was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date of the last update of the record' })
  updatedAt: Date;

  constructor(beerStyleFromPrisma: BeerStyle) {
    Object.assign(this, beerStyleFromPrisma);

    const convertDecimal = (value: any): number | null => {
      if (value === null || value === undefined) return null;
      if (typeof value === 'number') return value;
      if (typeof value.toNumber === 'function') return value.toNumber();
      return Number(value);
    };

    this.minTemperature = convertDecimal(beerStyleFromPrisma.minTemperature);
    this.maxTemperature = convertDecimal(beerStyleFromPrisma.maxTemperature);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { BeerStyle } from '@prisma/client';

export class BeerStyleEntity {
  @ApiProperty({ description: 'O ID único do estilo de cerveja' })
  id: number;

  @ApiProperty({ description: 'O nome do estilo da cerveja' })
  name: string;

  @ApiProperty({
    description: 'A temperatura mínima ideal para consumo',
    type: 'number',
    format: 'decimal',
    required: false,
    nullable: true,
  })
  minTemperature: number | null;

  @ApiProperty({
    description: 'A temperatura máxima ideal para consumo',
    type: 'number',
    format: 'decimal',
    required: false,
    nullable: true,
  })
  maxTemperature: number | null;

  @ApiProperty({
    description: 'Uma breve descrição sobre o estilo',
    required: false,
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ description: 'A data em que o registro foi criado' })
  createdAt: Date;

  @ApiProperty({ description: 'A data da última atualização do registro' })
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

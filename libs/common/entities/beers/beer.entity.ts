import { ApiProperty } from '@nestjs/swagger';

export class BeerEntity {
  @ApiProperty({ description: 'The unique ID of the beer' })
  id: number;

  @ApiProperty({ description: 'The name of the beer' })
  name: string;

  @ApiProperty({
    description: 'The alcohol by volume (ABV) percentage of the beer',
    type: 'number',
    format: 'decimal',
  })
  abv: number;

  @ApiProperty({ description: 'The ID of the beer style' })
  styleId: number;

  @ApiProperty({ description: 'The ID of the brewery' })
  breweryId: number;

  @ApiProperty({ description: 'The date the record was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date of the last update of the record' })
  updatedAt: Date;

  constructor(beerFromPrisma: any) {
    Object.assign(this, beerFromPrisma);

    this.abv = typeof this.abv === 'number' ? this.abv : Number(this.abv);
  }
}

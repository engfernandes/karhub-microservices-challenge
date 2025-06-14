import { ApiProperty } from '@nestjs/swagger';

export class BreweryEntity {
  @ApiProperty({ description: 'The unique ID of the brewery' })
  id: number;

  @ApiProperty({ description: 'The name of the brewery' })
  name: string;

  @ApiProperty({ description: 'The date the record was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date of the last update of the record' })
  updatedAt: Date;

  constructor(breweryFromPrisma: any) {
    Object.assign(this, breweryFromPrisma);
  }
}

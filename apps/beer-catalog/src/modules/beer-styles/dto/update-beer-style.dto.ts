import { PartialType } from '@nestjs/swagger';
import { CreateBeerStyleDto } from './create-beer-style.dto';

export class UpdateBeerStyleDto extends PartialType(CreateBeerStyleDto) {}

import { CreateBreweryDto } from './create-brewery.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateBreweryDto extends PartialType(CreateBreweryDto) {}

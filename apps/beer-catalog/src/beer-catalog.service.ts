import { Injectable } from '@nestjs/common';

@Injectable()
export class BeerCatalogService {
  getHello(): string {
    return 'Hello World!';
  }
}

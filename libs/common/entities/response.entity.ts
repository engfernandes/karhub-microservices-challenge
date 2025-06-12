import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class ResponseEntity<T> {
  @ApiProperty({
    isArray: true,
    required: true,
  })
  data: T;

  @ApiProperty({
    description: 'The status of the response',
    enum: ['success', 'error'],
    default: 'success',
    required: false,
  })
  status: 'success' | 'error' = 'success';

  @ApiProperty({
    description: 'The message of the response',
    required: false,
  })
  message: string;

  @ApiProperty({
    type: () => PaginationMeta,
    required: false,
  })
  meta?: PaginationMeta;

  constructor(data: T, meta?: PaginationMeta) {
    this.status = 'success';
    this.message = 'Request successful';
    this.data = data;

    if (meta) {
      this.meta = meta;
    }
  }
}

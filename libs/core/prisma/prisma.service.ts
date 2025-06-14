import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService extends the PrismaClient and manages the database connection lifecycle for the application.
 * Implements OnModuleInit to ensure the connection is established when the module is initialized.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * Called when the module is initialized. Connects to the database.
   */
  async onModuleInit() {
    await this.$connect();
  }
}

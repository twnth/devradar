import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private ready = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.ready = true;
    } catch {
      this.ready = false;
    }
  }

  async onModuleDestroy() {
    if (this.ready) {
      await this.$disconnect();
    }
  }

  isReady() {
    return this.ready;
  }
}

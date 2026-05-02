import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { FeedModule } from "./modules/feed.module";
import { SecurityModule } from "./modules/security.module";
import { HealthModule } from "./modules/health.module";
import { InternalModule } from "./modules/internal.module";
import { AuthModule } from "./modules/auth.module";
import { UsersModule } from "./modules/users.module";
import { DashboardModule } from "./modules/dashboard.module";
import { PrismaModule } from "./common/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ["../../.env.local", ".env.local"],
      isGlobal: true
    }),
    PrismaModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    FeedModule,
    SecurityModule,
    DashboardModule,
    HealthModule,
    InternalModule,
    AuthModule,
    UsersModule
  ]
})
export class AppModule {}

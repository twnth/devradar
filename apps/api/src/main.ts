import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

function getCorsOrigins() {
  const origins = process.env.CORS_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins?.length ? origins : true;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: getCorsOrigins(),
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
  });
  app.setGlobalPrefix("");
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
}

bootstrap();

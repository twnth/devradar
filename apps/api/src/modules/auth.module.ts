import { Controller, Get, Module } from "@nestjs/common";

@Controller("api/v1/auth")
class AuthController {
  @Get("providers")
  providers() {
    return {
      github: true
    };
  }
}

@Module({
  controllers: [AuthController]
})
export class AuthModule {}

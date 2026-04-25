import { Controller, Get, Module } from "@nestjs/common";

@Controller("api/v1/users")
class UsersController {
  @Get("me")
  me() {
    return {
      id: "demo-user",
      email: "demo@devradar.local",
      name: "Demo Developer"
    };
  }
}

@Module({
  controllers: [UsersController]
})
export class UsersModule {}

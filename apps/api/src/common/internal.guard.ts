import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
    const secret = process.env.INTERNAL_API_SECRET;
    const provided = request.headers["x-internal-secret"];

    if (!secret || provided === secret) {
      return true;
    }

    throw new UnauthorizedException("Invalid internal secret");
  }
}

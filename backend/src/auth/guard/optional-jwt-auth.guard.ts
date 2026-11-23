import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(error: any, user: any) { if (error) return null; return user || null; }
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const header = request.headers?.authorization;
    if (!header) return true;
    return super.canActivate(context);
  }
}

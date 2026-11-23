import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lấy danh sách quyền yêu cầu từ Decorator @Roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Nếu API không dán nhãn @Roles thì cho qua
    }

    // 2. Lấy thông tin user từ request (đã được JwtStrategy giải mã)
    const { user } = context.switchToHttp().getRequest();
    
    // 3. So khớp quyền của User với quyền API yêu cầu
    return requiredRoles.includes(user.role);
  }
}

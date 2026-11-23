import { 
  Injectable, 
  ExecutionContext, 
  UnauthorizedException, 
  Inject 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken'; // Để dùng jwt.decode
import { Redis } from 'ioredis'; // Hoặc kiểu dữ liệu của Redis Client bạn dùng
import { TokenPayload } from '../interface/token-payload.interface'; // Đường dẫn tới interface của bạn

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  constructor(@Inject('REDIS_CLIENT')private redisClient: Redis) { super(); }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refresh_token; // Hoặc lấy từ Cookie

    const payload = jwt.decode(refreshToken) as TokenPayload;
    
    // Kiểm tra trong Redis
    const isBlacklisted = await this.redisClient.get(`blacklist:${payload.jti}`);
    console.log(payload, isBlacklisted);
    
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked. Please login again.');
    }
    const result = await super.canActivate(context);
    console.log(result as boolean);
    return result as boolean ;
  }
}
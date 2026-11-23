import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      // Lấy Token từ header dưới dạng 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Không cho phép Token hết hạn
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET as string,
    });
  }

  // Nếu Token hợp lệ, hàm này sẽ được gọi
  async validate(payload: any) {
    return { userId: payload.sub, phone: payload.phone, role: payload.role };
  }
}
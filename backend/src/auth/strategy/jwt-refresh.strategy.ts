import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') { // <--- Đặt tên định danh ở đây
  constructor() {
     super({
      jwtFromRequest: (req: Request)=>{
        return req?.cookies?.refresh_token || null;
      },
      // Không cho phép Token hết hạn
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
    });
  }

  async validate(payload: any) {
    // Nếu token hợp lệ (đúng chữ ký, chưa hết hạn), hàm này sẽ chạy
    // Trả về payload để NestJS nạp vào request.user
    return { ...payload };
  }
}
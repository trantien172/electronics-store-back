// auth/interfaces/token-payload.interface.ts
export interface TokenPayload {
  sub: string;      // userId
  username: string;
  role: string;
  jti: string;      // Unique ID cho mỗi lần cấp token
}
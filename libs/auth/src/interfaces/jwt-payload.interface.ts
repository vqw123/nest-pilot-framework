export interface JwtPayload {
  sub: string; // uuid
  aud: string; // projectId
  iss: string;
  jti: string;
  iat: number;
  exp: number;
}

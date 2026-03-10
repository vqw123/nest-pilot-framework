export interface JwtPayload {
  sub: number; // uid
  iss: string;
  iat: number;
  exp: number;
}

import { Algorithm } from 'jsonwebtoken';

export interface BearerModuleOptions {
  /**
   * JWKS endpoint URL.
   * auth 서버 직접 URL 또는 CDN URL 지정 가능.
   * jwksUri 또는 publicKey 중 하나 필수.
   */
  jwksUri?: string;

  /**
   * 정적 공개키 (base64 인코딩된 PEM).
   * auth 서버 접근이 불가능한 로컬 개발 환경 fallback용.
   * jwksUri 또는 publicKey 중 하나 필수.
   */
  publicKey?: string;

  /** JWT issuer 검증 */
  issuer?: string;

  /**
   * JWT audience 검증.
   * 게임 서버에서 자신의 projectId를 지정하면 다른 프로젝트 토큰을 거부한다.
   */
  audience?: string;

  /** 허용 알고리즘 (기본값: ['RS256']) */
  algorithms?: Algorithm[];
}

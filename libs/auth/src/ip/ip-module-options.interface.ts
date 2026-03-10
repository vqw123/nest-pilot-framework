export interface IpModuleOptions {
  /**
   * 허용 IP CIDR 목록. 설정 시 목록에 포함된 IP만 통과.
   * 비어있거나 미설정 시 모든 IP 허용 (blacklist만 적용).
   * 예: ['10.0.0.0/8', '192.168.1.1/32']
   */
  whitelist?: string[];

  /**
   * 차단 IP CIDR 목록. whitelist 통과 여부와 무관하게 항상 차단.
   * 예: ['1.2.3.4/32']
   */
  blacklist?: string[];
}

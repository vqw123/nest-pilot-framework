export interface BasicModuleOptions {
  /**
   * username, password를 검증하는 함수.
   * 유효하면 true, 유효하지 않으면 false 또는 예외를 던진다.
   */
  validate: (username: string, password: string) => boolean | Promise<boolean>;
}

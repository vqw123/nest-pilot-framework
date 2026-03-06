export type ConfigModuleOptions =
  | { appName: string; configPath?: never }
  | { configPath: string; appName?: never };

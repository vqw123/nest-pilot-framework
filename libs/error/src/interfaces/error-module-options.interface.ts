import { Provider } from '@nestjs/common';

export interface ErrorModuleOptions {
  customFilters?: Provider[];
}

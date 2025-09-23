import { Provider } from '@nestjs/common';
import { ErrorFilterType } from '../constants/error-filter.constants';

export interface ErrorModuleOptions {
  filters?: ErrorFilterType[];
  customFilters?: Provider[];
}

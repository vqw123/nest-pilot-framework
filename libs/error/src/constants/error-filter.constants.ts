import { Type } from '@nestjs/common';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { DatabaseExceptionFilter } from '../filters/database-exception.filter';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';

export const ErrorFilterType = {
  HTTP: 'HTTP',
  DATABASE: 'DATABASE',
  DOMAIN: 'DOMAIN',
};

export type ErrorFilterType = (typeof ErrorFilterType)[keyof typeof ErrorFilterType];

export const ErrorFilterClassMap: Record<ErrorFilterType, Type<any>> = {
  HTTP: HttpExceptionFilter,
  DATABASE: DatabaseExceptionFilter,
  DOMAIN: DomainExceptionFilter,
};

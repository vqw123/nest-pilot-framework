import { Redis } from 'ioredis';
import { Logger } from '@nestjs/common';
import { RedisClientOptions, RedisModuleOptions } from '../interfaces/redis.interface';
import { DEFAULT_REDIS_NAMESPACE } from '../constants/redis.constants';

export const createRedisClients = (options: RedisModuleOptions): Map<string, Redis> => {
  const configs: RedisClientOptions[] = Array.isArray(options.config)
    ? options.config
    : [options.config];

  if (configs.length === 0) {
    throw new Error('Redis config must have at least one client');
  }

  const clients = new Map<string, Redis>();

  for (const config of configs) {
    const { namespace = DEFAULT_REDIS_NAMESPACE, onClientReady, ...redisOptions } = config;

    if (clients.has(namespace)) {
      throw new Error(`Redis client with namespace "${namespace}" already exists`);
    }

    const client = new Redis(redisOptions);

    if (options.readyLog || onClientReady) {
      const logger = new Logger('RedisModule');

      client.on('ready', async () => {
        if (options.readyLog) {
          logger.log(`Redis client "${namespace}" is ready`);
        }
        if (onClientReady) {
          try {
            await onClientReady(client);
          } catch (error) {
            logger.error(`onClientReady failed for "${namespace}": ${error}`);
          }
        }
      });
    }

    clients.set(namespace, client);
  }

  return clients;
};

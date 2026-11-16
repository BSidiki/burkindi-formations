import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis {
  constructor() { super(process.env.REDIS_URL ?? 'redis://localhost:6379'); }
  /** Incrémente un compteur avec expiration ; renvoie la nouvelle valeur. */
  async hit(key: string, ttlSec: number) {
    const n = await this.incr(key);
    if (n === 1) await this.expire(key, ttlSec);
    return n;
  }
}

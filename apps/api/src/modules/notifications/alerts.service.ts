import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AlertsService {
  constructor(@InjectQueue('alerts') private q: Queue) {}
  push(type: string, ip: string, details: string) {
    return this.q.add('intrusion', { type, ip, details, at: new Date().toISOString() }, { attempts: 3, backoff: 5000 });
  }
}

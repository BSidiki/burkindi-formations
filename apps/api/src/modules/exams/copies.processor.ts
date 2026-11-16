import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.module';

@Processor('copies')
export class CopiesProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) { super(); }
  async process(job: Job<{ attemptId: string }>) {
    const a = await this.prisma.examAttempt.findUniqueOrThrow({ where: { id: job.data.attemptId } });
    const answers = a.answers as Record<string, number>;
    const qs = await this.prisma.question.findMany({ where: { id: { in: Object.keys(answers) } }, select: { id: true, correctIndex: true } });
    const good = qs.filter(q => answers[q.id] === q.correctIndex).length;
    await this.prisma.examAttempt.update({
      where: { id: a.id }, data: { score: qs.length ? Math.round((100 * good) / qs.length) : 0, correctedAt: new Date() },
    });
  }
}

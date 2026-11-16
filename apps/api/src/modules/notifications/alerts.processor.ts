import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';

@Processor('alerts')
export class AlertsProcessor extends WorkerHost {
  async process(job: Job) {
    const d = job.data;
    const text = `[BURKINDI] ${d.type} — IP ${d.ip} — ${d.details} (${d.at})`;
    await Promise.allSettled([this.whatsapp(text), this.email(text)]);
  }
  private async whatsapp(text: string) {
    if (!process.env.WHATSAPP_API_URL) return;
    await fetch(process.env.WHATSAPP_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: process.env.ALERT_WHATSAPP_TO, text }),
    });
  }
  private async email(text: string) {
    if (!process.env.SMTP_URL || !process.env.ALERT_EMAIL_TO) return;
    await nodemailer.createTransport(process.env.SMTP_URL)
      .sendMail({ to: process.env.ALERT_EMAIL_TO, subject: 'Alerte sécurité BURKINDI', text });
  }
}

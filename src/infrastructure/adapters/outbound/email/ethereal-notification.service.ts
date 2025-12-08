// src/infrastructure/adapters/outbound/email/ethereal-notification.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  INotificationService,
  TimeslotInfo,
} from '../../../../core/application/ports/outbound/notification-service.port';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class EtherealNotificationService implements INotificationService {
  private transporter: nodemailer.Transporter<SentMessageInfo>;
  private frontendUrl: string | undefined;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('ETHEREAL_HOST');
    const port = Number(this.config.get<string>('ETHEREAL_PORT'));
    const secure = this.config.get<string>('ETHEREAL_SECURE') === 'true';
    const user = this.config.get<string>('ETHEREAL_USER');
    const pass = this.config.get<string>('ETHEREAL_PASS');
    this.frontendUrl = this.config.get<string>('FRONTEND_URL');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    this.transporter
      .verify()
      .then(() => console.log('Conexión con Ethereal OK'))
      .catch((err) => console.error('Error de conexión con Ethereal:', err));
  }

  async sendAccountConfirmation(email: string, token: string): Promise<void> {
    const confirmLink = `${this.frontendUrl}/confirm?token=${token}`;
    const info = await this.transporter.sendMail({
      from: '"Inderbú ⚽" <no-reply@inderbu.test>',
      to: email,
      subject: '🎉 Bienvenido a Inderbú – Confirma tu correo',
      text: `
Hola 👋,

¡Bienvenido a Inderbú!

Para activar tu cuenta, haz clic en este enlace:
${confirmLink}

Este enlace expirará en 24 horas.

Si no fuiste tú, ignora este correo.

¡Nos vemos en la cancha!`,
      html: `
<table width="100%" style="max-width:600px;margin:auto;font-family:sans-serif;color:#333;">
  <tr>
    <td style="background:#00529B;padding:20px;text-align:center;color:white;">
      <h1>¡Bienvenido a Inderbú!</h1>
    </td>
  </tr>
  <tr>
    <td style="padding:30px;">
      <p>Hola 👋</p>
      <p>Gracias por registrarte en <strong>Inderbú</strong>, tu plataforma para reservar sub‑escenarios deportivos.</p>
      <p style="text-align:center;">
        <a href="${confirmLink}"
           style="display:inline-block;padding:12px 24px;background:#FFA800;color:white;text-decoration:none;border-radius:4px;">
          Activar mi cuenta
        </a>
      </p>
      <p>Este enlace expirará en <strong>24 horas</strong>. Si no solicitaste esto, puedes ignorar este correo.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <p style="font-size:12px;color:#777;">
        © ${new Date().getFullYear()} Inderbú. Todos los derechos reservados.
      </p>
    </td>
  </tr>
</table>`,
    });

    console.log(`✉️  Mensaje enviado: ${info.messageId}`);
    console.log(`🔗 Vista previa: ${nodemailer.getTestMessageUrl(info)}`);
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatTime(time: string): string {
    // Convierte "HH:mm:ss" a "HH:mm"
    return time.substring(0, 5);
  }

  private formatTimeslots(timeslots: TimeslotInfo[]): string {
    if (timeslots.length === 0) return 'Horarios no especificados';
    
    return timeslots
      .map((ts) => `${this.formatTime(ts.startTime)} - ${this.formatTime(ts.endTime)}`)
      .join(', ');
  }

  async sendReservationPending(
    email: string,
    reservationId: number,
    subScenarioName: string,
    initialDate: Date,
    finalDate: Date | undefined,
    timeslots: TimeslotInfo[],
  ): Promise<void> {
    const formattedInitialDate = this.formatDate(initialDate);
    const dateRangeStr = finalDate
      ? `desde el ${this.formatDate(initialDate)} hasta el ${this.formatDate(finalDate)}`
      : `el ${formattedInitialDate}`;
    const timeslotsStr = this.formatTimeslots(timeslots);

    const info = await this.transporter.sendMail({
      from: '"Inderbú ⚽" <no-reply@inderbu.test>',
      to: email,
      subject: 'Tu reserva está pendiente de confirmación',
      text: `
Hola 👋,

Tu reserva para ${subScenarioName} ${dateRangeStr} ha sido creada y está en estado PENDIENTE.

Detalles de tu reserva:
- Sub-escenario: ${subScenarioName}
- Fecha: ${dateRangeStr}
- Horarios: ${timeslotsStr}

Pronto recibirás instrucciones sobre el estado de tu reserva.

¡Gracias por usar Inderbú!`,
      html: `
<table width="100%" style="max-width:600px;margin:auto;font-family:sans-serif;color:#333;">
  <tr>
    <td style="background:#00529B;padding:20px;text-align:center;color:white;">
      <h1>Reserva Pendiente</h1>
    </td>
  </tr>
  <tr>
    <td style="padding:30px;">
      <p>Hola 👋</p>
      <p>Tu reserva para <strong>${subScenarioName}</strong> ${dateRangeStr} ha sido creada y está en estado <strong>PENDIENTE</strong>.</p>
      
      <div style="background:#f5f5f5;padding:15px;border-radius:5px;margin:20px 0;">
        <h3 style="margin-top:0;color:#00529B;">Detalles de tu reserva</h3>
        <p style="margin:8px 0;"><strong>Sub-escenario:</strong> ${subScenarioName}</p>
        <p style="margin:8px 0;"><strong>Fecha:</strong> ${dateRangeStr}</p>
        <p style="margin:8px 0;"><strong>Horarios:</strong> ${timeslotsStr}</p>
      </div>
      
      <p>Pronto recibirás instrucciones sobre el estado de tu reserva.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <p style="font-size:12px;color:#777;">
        © ${new Date().getFullYear()} Inderbú. Todos los derechos reservados.
      </p>
    </td>
  </tr>
</table>`,
    });

    console.log(`✉️  Mensaje de reserva pendiente enviado: ${info.messageId}`);
    console.log(`🔗 Vista previa: ${nodemailer.getTestMessageUrl(info)}`);
  }

  async sendReservationConfirmed(
    email: string,
    reservationId: number,
    subScenarioName: string,
    initialDate: Date,
    confirmedAt: Date,
    finalDate: Date | undefined,
    timeslots: TimeslotInfo[],
  ): Promise<void> {
    const formattedInitialDate = this.formatDate(initialDate);
    const dateRangeStr = finalDate
      ? `desde el ${this.formatDate(initialDate)} hasta el ${this.formatDate(finalDate)}`
      : `el ${formattedInitialDate}`;
    const confirmedDateStr = confirmedAt.toLocaleString('es-CO', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
    const timeslotsStr = this.formatTimeslots(timeslots);

    const info = await this.transporter.sendMail({
      from: '"Inderbú ⚽" <no-reply@inderbu.test>',
      to: email,
      subject: 'Tu reserva ha sido confirmada',
      text: `
Hola 👋,

¡Excelente noticia! Tu reserva para ${subScenarioName} ${dateRangeStr} ha sido CONFIRMADA.

Detalles de tu reserva:
- Sub-escenario: ${subScenarioName}
- Fecha: ${dateRangeStr}
- Horarios: ${timeslotsStr}
- Fecha de confirmación: ${confirmedDateStr}

¡Nos vemos en la cancha!`,
      html: `
<table width="100%" style="max-width:600px;margin:auto;font-family:sans-serif;color:#333;">
  <tr>
    <td style="background:#28a745;padding:20px;text-align:center;color:white;">
      <h1>✅ Reserva Confirmada</h1>
    </td>
  </tr>
  <tr>
    <td style="padding:30px;">
      <p>Hola 👋</p>
      <p>¡Excelente noticia! Tu reserva para <strong>${subScenarioName}</strong> ${dateRangeStr} ha sido <strong style="color:#28a745;">CONFIRMADA</strong>.</p>
      
      <div style="background:#f5f5f5;padding:15px;border-radius:5px;margin:20px 0;">
        <h3 style="margin-top:0;color:#28a745;">Detalles de tu reserva</h3>
        <p style="margin:8px 0;"><strong>Sub-escenario:</strong> ${subScenarioName}</p>
        <p style="margin:8px 0;"><strong>Fecha:</strong> ${dateRangeStr}</p>
        <p style="margin:8px 0;"><strong>Horarios:</strong> ${timeslotsStr}</p>
        <p style="margin:8px 0;"><strong>Fecha de confirmación:</strong> ${confirmedDateStr}</p>
      </div>
      
      <p style="text-align:center;margin:30px 0;">
        <span style="display:inline-block;padding:12px 24px;background:#28a745;color:white;border-radius:4px;font-weight:bold;">
          ¡Nos vemos en la cancha!
        </span>
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <p style="font-size:12px;color:#777;">
        © ${new Date().getFullYear()} Inderbú. Todos los derechos reservados.
      </p>
    </td>
  </tr>
</table>`,
    });

    console.log(`✉️  Mensaje de reserva confirmada enviado: ${info.messageId}`);
    console.log(`🔗 Vista previa: ${nodemailer.getTestMessageUrl(info)}`);
  }

  async sendReservationCancelled(
    email: string,
    reservationId: number,
    subScenarioName: string,
    initialDate: Date,
    finalDate?: Date,
  ): Promise<void> {
    const dateStr = initialDate.toISOString().split('T')[0];
    const dateRangeStr = finalDate
      ? `desde ${dateStr} hasta ${finalDate.toISOString().split('T')[0]}`
      : `para el ${dateStr}`;

    const info = await this.transporter.sendMail({
      from: '"Inderbú ⚽" <no-reply@inderbu.test>',
      to: email,
      subject: 'Tu reserva ha sido cancelada',
      text: `
Hola 👋,

Tu reserva para ${subScenarioName} ${dateRangeStr} ha sido CANCELADA.

Si tienes alguna pregunta, no dudes en contactarnos.`,
      html: `
<table width="100%" style="max-width:600px;margin:auto;font-family:sans-serif;color:#333;">
  <tr>
    <td style="background:#dc3545;padding:20px;text-align:center;color:white;">
      <h1>Reserva Cancelada</h1>
    </td>
  </tr>
  <tr>
    <td style="padding:30px;">
      <p>Hola 👋</p>
      <p>Tu reserva para <strong>${subScenarioName}</strong> ${dateRangeStr} ha sido <strong style="color:#dc3545;">CANCELADA</strong>.</p>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <p style="font-size:12px;color:#777;">
        © ${new Date().getFullYear()} Inderbú. Todos los derechos reservados.
      </p>
    </td>
  </tr>
</table>`,
    });

    console.log(`✉️  Mensaje de reserva cancelada enviado: ${info.messageId}`);
    console.log(`🔗 Vista previa: ${nodemailer.getTestMessageUrl(info)}`);
  }
}

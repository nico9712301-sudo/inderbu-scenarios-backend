// src/infrastructure/adapters/outbound/email/ethereal-notification.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INotificationService } from 'src/core/application/ports/outbound/notification-service.port';
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
}

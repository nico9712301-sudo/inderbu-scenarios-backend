import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import { ReceiptDomainEntity } from '../../../../core/domain/entities/receipt.domain-entity';

@Injectable()
export class ReceiptEmailService {
  private transporter: nodemailer.Transporter<SentMessageInfo>;

  constructor(
    private readonly configService: ConfigService,
  ) {
    // Initialize email transporter
    const host = this.configService.get<string>('ETHEREAL_HOST');
    const port = Number(this.configService.get<string>('ETHEREAL_PORT'));
    const secure = this.configService.get<string>('ETHEREAL_SECURE') === 'true';
    const user = this.configService.get<string>('ETHEREAL_USER');
    const pass = this.configService.get<string>('ETHEREAL_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  /**
   * Sends a receipt via email with HTML content embedded
   */
  async sendReceiptEmailWithHtml(
    email: string,
    receipt: ReceiptDomainEntity,
    receiptHtml: string,
  ): Promise<void> {
    try {
      // Generate email wrapper HTML
      const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo de Pago - Reserva #${receipt.fkReservationId}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: #00529B; padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Recibo de Pago</h1>
            </td>
          </tr>
          <!-- Email Body -->
          <tr>
            <td style="padding: 30px 20px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hola,</p>
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Adjuntamos el recibo de pago correspondiente a tu <strong>reserva #${receipt.fkReservationId}</strong>.
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Este recibo fue generado el <strong>${receipt.generatedAt.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</strong>.
              </p>
            </td>
          </tr>
          <!-- Receipt HTML Content -->
          <tr>
            <td style="padding: 0 20px 30px 20px;">
              ${receiptHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px; background-color: #f9f9f9; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                Si tienes alguna pregunta, no dudes en contactarnos.
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Inderbú. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      // Send email with HTML content
      const info = await this.transporter.sendMail({
        from: '"Inderbú ⚽" <no-reply@inderbu.test>',
        to: email,
        subject: `Recibo de Pago - Reserva #${receipt.fkReservationId}`,
        text: `
Hola,

Adjuntamos el recibo de pago correspondiente a tu reserva #${receipt.fkReservationId}.

Este recibo fue generado el ${receipt.generatedAt.toLocaleDateString('es-CO')}.

Si tienes alguna pregunta, no dudes en contactarnos.

¡Gracias por elegir Inderbú!
        `,
        html: emailHtml,
      });

      console.log(`✉️  Recibo enviado por email: ${info.messageId}`);
      console.log(`🔗 Vista previa: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
      console.error('Error al enviar recibo por email:', error);
      throw new Error(
        `No se pudo enviar el recibo por email: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
    }
  }
}


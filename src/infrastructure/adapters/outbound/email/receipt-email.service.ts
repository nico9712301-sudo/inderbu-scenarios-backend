import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import { ReceiptDomainEntity } from '../../../../core/domain/entities/receipt.domain-entity';
import { CloudflareR2Service } from '../file-storage/cloudflare-r2.service';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class ReceiptEmailService {
  private transporter: nodemailer.Transporter<SentMessageInfo>;
  private r2Client: S3Client;
  private bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly r2Service: CloudflareR2Service,
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

    // Initialize R2 client for downloading PDFs
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || '';

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error('R2 configuration is missing');
    }

    this.r2Client = new S3Client({
      endpoint,
      region: 'auto',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Downloads a PDF from R2 by key
   */
  private async downloadPdfFromR2(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.r2Client.send(command);
      
      if (!response.Body) {
        throw new Error('No se pudo descargar el PDF desde R2');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as Readable;

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      throw new Error(
        `Error al descargar PDF desde R2: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
    }
  }

  /**
   * Extracts the R2 key from a full URL or returns the key if it's already a key
   */
  private extractR2Key(pdfUrl: string): string {
    // If it's already a key (no http/https), return as is
    if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://')) {
      return pdfUrl;
    }

    // Extract key from URL
    try {
      const url = new URL(pdfUrl);
      // Remove leading slash
      return url.pathname.substring(1);
    } catch {
      // If URL parsing fails, assume it's already a key
      return pdfUrl;
    }
  }

  /**
   * Sends a receipt via email with PDF attachment (using provided PDF buffer)
   */
  async sendReceiptEmailWithPdf(
    email: string,
    receipt: ReceiptDomainEntity,
    pdfBuffer: Buffer,
  ): Promise<void> {
    try {
      // Generate filename from receipt
      const fileName = `recibo_${receipt.fkReservationId}_${receipt.generatedAt.toISOString().split('T')[0]}.pdf`;

      // Send email with PDF attachment
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
        html: `
<table width="100%" style="max-width:600px;margin:auto;font-family:sans-serif;color:#333;">
  <tr>
    <td style="background:#00529B;padding:20px;text-align:center;color:white;">
      <h1>Recibo de Pago</h1>
    </td>
  </tr>
  <tr>
    <td style="padding:30px;">
      <p>Hola,</p>
      <p>Adjuntamos el recibo de pago correspondiente a tu <strong>reserva #${receipt.fkReservationId}</strong>.</p>
      <p>Este recibo fue generado el <strong>${receipt.generatedAt.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</strong>.</p>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <p style="font-size:12px;color:#777;">
        © ${new Date().getFullYear()} Inderbú. Todos los derechos reservados.
      </p>
    </td>
  </tr>
</table>
        `,
        attachments: [
          {
            filename: fileName,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
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

  /**
   * Sends a receipt via email with PDF attachment (legacy method for backward compatibility)
   */
  async sendReceiptEmail(email: string, receipt: ReceiptDomainEntity): Promise<void> {
    // This method is kept for backward compatibility but should not be used
    // Use sendReceiptEmailWithPdf instead
    throw new Error('Este método está deprecado. Use sendReceiptEmailWithPdf en su lugar.');
  }
}


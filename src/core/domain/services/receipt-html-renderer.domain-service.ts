import { Injectable } from '@nestjs/common';
import { ReceiptDomainEntity } from '../entities/receipt.domain-entity';
import { ReservationDomainEntity } from '../entities/reservation.domain-entity';

export interface TemplateComponentConfig {
  id: string;
  type: string;
  props?: Record<string, any>;
  position?: { x: number; y: number };
}

export interface TemplateContent {
  components: TemplateComponentConfig[];
}

export interface ReceiptRenderData {
  receipt: ReceiptDomainEntity;
  reservation: ReservationDomainEntity;
  templateContent: TemplateContent;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  scenarioName: string;
  subScenarioName: string;
  hourlyPrice: number;
  totalCost: number;
  totalHours: number;
  reservationDate: string;
  currentDate: string;
  currentTime: string;
}

@Injectable()
export class ReceiptHtmlRendererDomainService {
  /**
   * Generates HTML string from receipt data and template content
   */
  generateReceiptHtml(data: ReceiptRenderData): string {
    const { templateContent, hourlyPrice, totalCost, totalHours, clientName, clientEmail, clientPhone, scenarioName, subScenarioName, reservationDate, currentDate, currentTime } = data;

    // Format price values
    const formatCOP = (value: number): string => {
      return Math.round(value).toLocaleString('es-CO');
    };

    const formattedHourlyPrice = formatCOP(hourlyPrice);
    const formattedTotalAmount = formatCOP(totalCost);

    // Sort components by position (y coordinate) for proper rendering order
    const sortedComponents = [...(templateContent.components || [])].sort((a, b) => {
      const yA = a.position?.y || 0;
      const yB = b.position?.y || 0;
      return yA - yB;
    });

    // Start HTML document
    let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo de Pago</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      min-height: 800px;
    }
    .component {
      margin-bottom: 20px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo-placeholder {
      width: 128px;
      height: 64px;
      background-color: #e5e5e5;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #666;
    }
    .title {
      text-align: center;
      margin-bottom: 30px;
    }
    .title h1 {
      font-size: 28px;
      font-weight: bold;
      color: #1a1a1a;
    }
    .client-data {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .client-data h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #1a1a1a;
    }
    .client-data p {
      margin: 8px 0;
      font-size: 14px;
    }
    .client-data strong {
      font-weight: 600;
      color: #333;
    }
    .concepts-table {
      margin-bottom: 20px;
    }
    .concepts-table table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #ddd;
    }
    .concepts-table th {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    .concepts-table th.text-right {
      text-align: right;
    }
    .concepts-table td {
      border: 1px solid #ddd;
      padding: 12px;
      font-size: 14px;
    }
    .concepts-table td.text-right {
      text-align: right;
    }
    .concepts-table td.font-semibold {
      font-weight: 600;
    }
    .hourly-cost {
      background-color: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .hourly-cost p {
      margin: 8px 0;
      font-size: 14px;
    }
    .hourly-cost strong {
      font-weight: 600;
    }
    .total {
      background-color: #e8f5e9;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #4caf50;
      margin-bottom: 20px;
    }
    .total .total-label {
      font-size: 18px;
      font-weight: bold;
      display: inline-block;
    }
    .total .total-amount {
      font-size: 24px;
      font-weight: bold;
      color: #2e7d32;
      float: right;
    }
    .bank-data {
      background-color: #fff9c4;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .bank-data h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .bank-data p {
      margin: 8px 0;
      font-size: 14px;
    }
    .payment-qr {
      text-align: center;
      margin-bottom: 20px;
    }
    .payment-qr .qr-container {
      display: inline-block;
      padding: 16px;
      background: white;
      border: 2px solid #ddd;
      border-radius: 8px;
    }
    .payment-qr img {
      width: 128px;
      height: 128px;
      display: block;
    }
    .payment-qr p {
      font-size: 12px;
      color: #666;
      margin-top: 8px;
      text-align: center;
    }
    .free-text {
      margin-bottom: 20px;
    }
    .free-text p {
      font-size: 14px;
      line-height: 1.6;
    }
    .date {
      margin-bottom: 20px;
    }
    .date p {
      font-size: 14px;
    }
    .date strong {
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="receipt-container">`;

    // Render each component
    if (sortedComponents.length === 0) {
      html += `
    <div style="text-align: center; padding: 48px; color: #666;">
      <p>La plantilla no tiene componentes configurados.</p>
    </div>`;
    } else {
      for (const component of sortedComponents) {
        html += this.renderComponent(component, {
          clientName,
          clientEmail,
          clientPhone: clientPhone || 'N/A',
          scenarioName,
          subScenarioName,
          totalHours,
          formattedHourlyPrice,
          formattedTotalAmount,
          reservationDate,
          currentDate,
          currentTime,
        });
      }
    }

    html += `
  </div>
</body>
</html>`;

    return html;
  }

  private renderComponent(component: TemplateComponentConfig, data: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    scenarioName: string;
    subScenarioName: string;
    totalHours: number;
    formattedHourlyPrice: string;
    formattedTotalAmount: string;
    reservationDate: string;
    currentDate: string;
    currentTime: string;
  }): string {
    const { type, props } = component;
    const { clientName, clientEmail, clientPhone, scenarioName, subScenarioName, totalHours, formattedHourlyPrice, formattedTotalAmount, reservationDate, currentDate, currentTime } = data;

    switch (type) {
      case 'logo':
        return `
    <div class="component logo">
      <div class="logo-placeholder">LOGO</div>
    </div>`;

      case 'title':
        const titleText = props?.text || 'RECIBO DE PAGO';
        return `
    <div class="component title">
      <h1>${this.escapeHtml(titleText)}</h1>
    </div>`;

      case 'client-data':
        return `
    <div class="component client-data">
      <h3>Datos del Cliente</h3>
      <p><strong>Nombre:</strong> ${this.escapeHtml(clientName)}</p>
      <p><strong>Email:</strong> ${this.escapeHtml(clientEmail)}</p>
      <p><strong>Teléfono:</strong> ${this.escapeHtml(clientPhone)}</p>
    </div>`;

      case 'concepts-table':
        return `
    <div class="component concepts-table">
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th class="text-right">Horas</th>
            <th class="text-right">Precio/Hora</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${this.escapeHtml(subScenarioName)}</td>
            <td class="text-right">${totalHours}</td>
            <td class="text-right">$${formattedHourlyPrice}</td>
            <td class="text-right font-semibold">$${formattedTotalAmount}</td>
          </tr>
        </tbody>
      </table>
    </div>`;

      case 'hourly-cost':
        return `
    <div class="component hourly-cost">
      <p><strong>Costo por Hora:</strong> $${formattedHourlyPrice}</p>
    </div>`;

      case 'total':
        return `
    <div class="component total">
      <span class="total-label">TOTAL:</span>
      <span class="total-amount">$${formattedTotalAmount}</span>
      <div style="clear: both;"></div>
    </div>`;

      case 'bank-data':
        return `
    <div class="component bank-data">
      <h3>Datos Bancarios</h3>
      <p><strong>Banco:</strong> Banco Ejemplo</p>
      <p><strong>Cuenta:</strong> ES12 3456 7890 1234 5678 9012</p>
    </div>`;

      case 'payment-qr':
        const qrData = encodeURIComponent(`Recibo - ${formattedTotalAmount} COP`);
        return `
    <div class="component payment-qr">
      <div class="qr-container">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}" alt="QR de Pago" />
        <p>Escanea para pagar</p>
      </div>
    </div>`;

      case 'free-text':
        const freeText = props?.text || '';
        return `
    <div class="component free-text">
      <p>${this.escapeHtml(freeText)}</p>
    </div>`;

      case 'date':
        return `
    <div class="component date">
      <p><strong>Fecha:</strong> ${currentDate} ${currentTime}</p>
    </div>`;

      default:
        return `
    <div class="component" style="padding: 8px; background-color: #f5f5f5; border-radius: 4px; font-size: 12px; color: #666;">
      Componente: ${this.escapeHtml(type)}
    </div>`;
    }
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

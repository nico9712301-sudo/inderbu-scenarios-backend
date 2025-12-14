import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfGenerationService {
  constructor() {}

  /**
   * Generates a PDF from HTML content and returns it as a Buffer
   * @param htmlContent - The HTML content to convert to PDF
   * @param fileName - Optional custom filename (without extension)
   * @returns The PDF as a Buffer
   */
  async generatePdfFromHtml(
    htmlContent: string,
    fileName?: string,
  ): Promise<Buffer> {
    let browser: puppeteer.Browser | null = null;

    try {
      // Launch browser with Chrome installation path
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        // Use Chrome from Puppeteer's cache if available
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      });

      const page = await browser.newPage();

      // Set content
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      // Close browser
      await browser.close();
      browser = null;

      // Return PDF as Buffer
      return Buffer.from(pdfBuffer);
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      throw new Error(
        `Error al generar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
    }
  }

}


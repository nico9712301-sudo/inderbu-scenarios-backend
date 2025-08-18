import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.log('Exception caught:', exception);

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Obtiene la respuesta de la excepción
    const resMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Transformamos resMessage a string | string[]
    let message: string | string[];

    if (typeof resMessage === 'string') {
      message = resMessage;
    } else if (Array.isArray(resMessage)) {
      message = resMessage;
    } else if (typeof resMessage === 'object' && resMessage !== null) {
      // Si el objeto contiene una propiedad "message" y es un array, la usamos
      if (Array.isArray((resMessage as any).message)) {
        message = (resMessage as any).message;
      } else if (
        (resMessage as any).message &&
        typeof (resMessage as any).message === 'string'
      ) {
        message = (resMessage as any).message;
      } else {
        // Fallback: convertir todo el objeto a cadena JSON
        message = JSON.stringify(resMessage);
      }
    } else {
      message = 'Internal server error';
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

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
    console.log('Exception type:', exception?.constructor?.name);

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Obtiene la respuesta de la excepción
    const resMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';
    
    console.log('Exception response:', resMessage);
    console.log('Exception response type:', typeof resMessage);

    // Transformamos resMessage a string | string[]
    let message: string | string[];
    let details: any = undefined;

    if (typeof resMessage === 'string') {
      message = resMessage;
    } else if (Array.isArray(resMessage)) {
      message = resMessage;
    } else if (typeof resMessage === 'object' && resMessage !== null) {
      console.log('Processing object response:', JSON.stringify(resMessage, null, 2));
      
      // Si el objeto contiene una propiedad "message" y es un array, la usamos
      if (Array.isArray((resMessage as any).message)) {
        message = (resMessage as any).message;
      } else if (
        (resMessage as any).message &&
        typeof (resMessage as any).message === 'string'
      ) {
        message = (resMessage as any).message;
        console.log('Extracted message:', message);
        
        // Si hay información adicional (como conflicts), incluirla en details
        // Los conflicts pueden estar en el mismo nivel que message
        if ((resMessage as any).conflicts) {
          details = {
            conflicts: (resMessage as any).conflicts,
            totalConflicts: (resMessage as any).totalConflicts,
          };
          console.log('Found conflicts in response:', details);
        } else {
          console.log('No conflicts found in response object');
        }
      } else {
        // Si no hay message pero hay conflicts directamente, usar el objeto completo
        if ((resMessage as any).conflicts) {
          message = (resMessage as any).message || 'Conflicto detectado';
          details = {
            conflicts: (resMessage as any).conflicts,
            totalConflicts: (resMessage as any).totalConflicts,
          };
          console.log('Found conflicts without message:', details);
        } else {
          // Fallback: convertir todo el objeto a cadena JSON
          message = JSON.stringify(resMessage);
          console.log('No message or conflicts, using JSON string');
        }
      }
    } else {
      message = 'Internal server error';
    }

    const responseBody: any = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Incluir detalles adicionales si existen (para ConflictException con conflicts)
    if (details) {
      responseBody.details = details;
      console.log('Adding details to response:', details);
    } else {
      console.log('No details to add to response');
    }

    console.log('Final response body:', JSON.stringify(responseBody, null, 2));
    response.status(status).json(responseBody);
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | StreamableFile>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T> | StreamableFile> {
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((payload: any) => {
        // Si es un StreamableFile, NO interceptar - devolver tal como está
        if (payload instanceof StreamableFile) {
          return payload;
        }

        // Si el payload ya trae { data, meta } lo dejamos plano
        if (
          payload &&
          payload.data !== undefined &&
          payload.meta !== undefined
        ) {
          return {
            statusCode,
            message: 'Success',
            ...payload, // ⬅️  expande data y meta al mismo nivel
          };
        }

        // Caso normal: payload es un DTO simple o un array
        return {
          statusCode,
          message: 'Success',
          data: payload,
        };
      }),
    );
  }
}

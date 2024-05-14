import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { Observable, map } from 'rxjs';

@Injectable()
export class CookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const res = context.switchToHttp().getResponse<Response>();
        if (data && data.access_token) {
          res.cookie('aurora_token', data.access_token, {
            httpOnly: true,
            secure: true,
            expires: new Date(Date.now() + 86400e3),
          });

          delete data.access_token;
        }
        return data;
      }),
    );
  }
}

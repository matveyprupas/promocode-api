import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

function isPrismaClientKnownRequestError(
  err: unknown,
): err is { code: string; name: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { name?: unknown }).name === 'PrismaClientKnownRequestError' &&
    typeof (err as { code?: unknown }).code === 'string'
  );
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response
        .status(status)
        .json(
          typeof body === 'string'
            ? { statusCode: status, message: body }
            : body,
        );
      return;
    }

    if (isPrismaClientKnownRequestError(exception)) {
      const { status, message } = this.mapPrismaKnownRequest(exception.code);
      response.status(status).json({
        statusCode: status,
        message,
        path: request.url,
      });
      return;
    }

    this.logger.error(
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      path: request.url,
    });
  }

  private mapPrismaKnownRequest(code: string): {
    status: HttpStatus;
    message: string;
  } {
    switch (code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: 'Unique constraint violation',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Database request failed',
        };
    }
  }
}

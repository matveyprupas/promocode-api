import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { STATUS_CODES } from 'node:http';
import { Response } from 'express';

function httpErrorLabel(status: number): string {
  return STATUS_CODES[status] ?? 'Error';
}

function normalizeErrorMessage(message: unknown, fallback: string): string {
  if (typeof message === 'string') {
    return message;
  }
  if (Array.isArray(message)) {
    const strings = message.filter((m): m is string => typeof m === 'string');
    return strings.length > 0 ? strings.join('; ') : fallback;
  }
  return fallback;
}

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

  private formatErrorPayload(status: number, message: string) {
    return {
      statusCode: status,
      error: httpErrorLabel(status),
      message,
    };
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      let message: string;
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const b = body as Record<string, unknown>;
        message = normalizeErrorMessage(
          b.message ?? b.messages,
          exception.message,
        );
      } else {
        message = exception.message;
      }
      response.status(status).json(this.formatErrorPayload(status, message));
      return;
    }

    if (isPrismaClientKnownRequestError(exception)) {
      const { status, message } = this.mapPrismaKnownRequest(exception.code);
      response.status(status).json(this.formatErrorPayload(status, message));
      return;
    }

    this.logger.error(
      exception instanceof Error ? exception.stack : String(exception),
    );

    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(
        this.formatErrorPayload(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Internal server error',
        ),
      );
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

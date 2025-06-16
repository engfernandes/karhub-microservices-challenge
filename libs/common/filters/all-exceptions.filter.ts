import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Request, Response } from 'express';

/**
 * Global exception filter that catches all unhandled exceptions and formats the HTTP response.
 * Handles both HTTP and RPC exceptions, logs errors, and provides a consistent error response structure.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * Handles the caught exception and sends a formatted HTTP response.
   * @param exception The exception thrown during request processing.
   * @param host The arguments host containing request and response objects.
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof RpcException) {
      const rpcError = exception.getError();
      message = typeof rpcError === 'object' ? rpcError['message'] : rpcError;
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    } else if (typeof exception === 'object' && exception) {
      if ('statusCode' in exception && 'message' in exception) {
        status = exception['statusCode'] as HttpStatus;
        message = exception;
      }
    }

    this.logger.error(
      `HTTP Status: ${status} | Path: ${request.url}`,
      JSON.stringify(exception),
    );

    const responseBody = typeof message === 'object' ? message : { message };

    response.status(status).json({
      ...responseBody,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

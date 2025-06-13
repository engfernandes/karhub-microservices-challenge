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

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

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
      status = HttpStatus.INTERNAL_SERVER_ERROR; // Geralmente são erros 500
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

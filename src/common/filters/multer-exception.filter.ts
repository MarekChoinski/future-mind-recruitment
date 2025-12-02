import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.code === 'LIMIT_FILE_SIZE') {
      const error = new PayloadTooLargeException('File size exceeds 5MB limit');
      response.status(error.getStatus()).json(error.getResponse());
    } else {
      response.status(400).json({
        statusCode: 400,
        message: exception.message,
        error: 'Bad Request',
      });
    }
  }
}

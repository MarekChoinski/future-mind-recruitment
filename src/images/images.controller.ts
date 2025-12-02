import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { multerConfig } from '../config/multer.config';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('width') width: string,
    @Body('height') height: string,
  ) {
    return {
      message: 'File uploaded successfully',
      file: {
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      },
      metadata: {
        title,
        width: parseInt(width, 10),
        height: parseInt(height, 10),
      },
    };
  }
}


import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  UseFilters,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { multerConfig } from '../config/multer.config';
import { ImageResponseDto } from './dto/image-response.dto';
import { toImageResponseDto } from './mappers/image.mapper';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';
import { MulterExceptionFilter } from '../common/filters/multer-exception.filter';

@Controller('images')
@UseFilters(MulterExceptionFilter)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadImage(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Body('title') title: string,
    @Body('width') width: string,
    @Body('height') height: string,
  ): Promise<ImageResponseDto> {
    const image = await this.imagesService.createImage(
      title,
      parseInt(width, 10),
      parseInt(height, 10),
      file.path,
      file.filename,
    );

    return toImageResponseDto(image);
  }
}


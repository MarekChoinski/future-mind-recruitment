import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Body,
  UseFilters,
  Query,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { multerConfig } from '../config/multer.config';
import { ImageResponseDto } from './dto/image-response.dto';
import { ImagesListResponseDto } from './dto/images-list-response.dto';
import { GetImagesQueryDto } from './dto/get-images-query.dto';
import { toImageResponseDto } from './mappers/image.mapper';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';
import { MulterExceptionFilter } from '../common/filters/multer-exception.filter';

@Controller('images')
@UseFilters(MulterExceptionFilter)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  async findAll(
    @Query() query: GetImagesQueryDto,
  ): Promise<ImagesListResponseDto> {
    const result = await this.imagesService.findAll(
      query.page,
      query.limit,
      query.title,
    );

    return {
      data: result.images.map(toImageResponseDto),
      meta: {
        count: result.count,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ImageResponseDto> {
    const image = await this.imagesService.findOne(id);
    return toImageResponseDto(image);
  }

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


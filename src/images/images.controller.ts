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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { multerConfig } from '../config/multer.config';
import { ImageResponseDto } from './dto/image-response.dto';
import { ImagesListResponseDto } from './dto/images-list-response.dto';
import { GetImagesQueryDto } from './dto/get-images-query.dto';
import { toImageResponseDto } from './mappers/image.mapper';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';
import { MulterExceptionFilter } from '../common/filters/multer-exception.filter';

@ApiTags('images')
@Controller('images')
@UseFilters(MulterExceptionFilter)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all images with pagination and filtering' })
  @ApiResponse({ status: 200, type: ImagesListResponseDto })
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
  @ApiOperation({ summary: 'Get single image by ID' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, type: ImageResponseDto })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async findOne(@Param('id') id: string): Promise<ImageResponseDto> {
    const image = await this.imagesService.findOne(id);
    return toImageResponseDto(image);
  }

  @Post()
  @ApiOperation({ summary: 'Upload and process image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'title', 'width', 'height'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpeg, png, webp, gif, max 5MB)',
        },
        title: {
          type: 'string',
          example: 'Beautiful landscape',
        },
        width: {
          type: 'number',
          example: 1920,
        },
        height: {
          type: 'number',
          example: 1080,
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: ImageResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request (validation error)' })
  @ApiResponse({ status: 413, description: 'File too large' })
  @ApiResponse({ status: 415, description: 'Unsupported media type' })
  @ApiResponse({ status: 500, description: 'Failed to process image' })
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
      file.originalname,
    );

    return toImageResponseDto(image);
  }
}


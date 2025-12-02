import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ImageProcessingService } from './services/image-processing.service';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly imageProcessingService: ImageProcessingService,
    private readonly configService: ConfigService,
  ) {}

  async createImage(
    title: string,
    targetWidth: number,
    targetHeight: number,
    tmpPath: string,
    tmpFilename: string,
    originalFilename?: string,
  ) {
    const startTime = Date.now();
    const processedFilename = tmpFilename;
    const processedPath = join('uploads', 'processed', processedFilename);

    this.logger.log(
      `Starting image processing: ${originalFilename || tmpFilename}`,
    );
    this.logger.log(
      `Generated filename: ${processedFilename}, Target dimensions: ${targetWidth}x${targetHeight}`,
    );

    try {
      const dimensions = await this.imageProcessingService.processAndOptimize(
        tmpPath,
        processedPath,
        targetWidth,
        targetHeight,
      );

      await unlink(tmpPath);

      const processingTime = Date.now() - startTime;

      this.logger.log(
        `Image processed successfully: ${processedFilename}, Final dimensions: ${dimensions.width}x${dimensions.height}, Processing time: ${processingTime}ms`,
      );

      const appUrl = this.configService.get<string>('APP_URL');
      const url = `${appUrl}/static/${processedFilename}`;

      return this.prisma.image.create({
        data: {
          title,
          width: dimensions.width,
          height: dimensions.height,
          path: processedPath,
          url,
        },
      });
    } catch (error) {
      const errorStack =
        error instanceof Error ? error.stack : 'No stack trace';
      this.logger.error(
        `Failed to process image: ${originalFilename || tmpFilename}`,
        errorStack,
      );
      await this.cleanupFiles(tmpPath, processedPath);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        'Failed to process image',
        errorMessage,
      );
    }
  }

  async findAll(page: number = 1, limit: number = 10, title?: string) {
    const skip = (page - 1) * limit;

    const where = title
      ? {
          title: {
            contains: title,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const [images, count] = await Promise.all([
      this.prisma.image.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.image.count({ where }),
    ]);

    return {
      images,
      count,
      page,
      limit,
      pages: Math.ceil(count / limit),
    };
  }

  async findOne(id: string) {
    const image = await this.prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return image;
  }

  private async cleanupFiles(...paths: string[]): Promise<void> {
    for (const path of paths) {
      try {
        if (existsSync(path)) {
          await unlink(path);
        }
      } catch {
        // Ignore cleanup errors - file may already be deleted
      }
    }
  }
}

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageProcessingService } from './services/image-processing.service';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class ImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageProcessingService: ImageProcessingService,
  ) {}

  async createImage(
    title: string,
    targetWidth: number,
    targetHeight: number,
    tmpPath: string,
    tmpFilename: string,
  ) {
    const processedFilename = tmpFilename;
    const processedPath = join('uploads', 'processed', processedFilename);

    try {
      const dimensions = await this.imageProcessingService.processAndOptimize(
        tmpPath,
        processedPath,
        targetWidth,
        targetHeight,
      );

      await unlink(tmpPath);

      const url = `/static/processed/${processedFilename}`;

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
      await this.cleanupFiles(tmpPath, processedPath);
      throw new InternalServerErrorException(
        'Failed to process image',
        error.message,
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
      } catch (error) {}
    }
  }
}


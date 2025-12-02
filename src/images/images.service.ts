import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageProcessingService } from './services/image-processing.service';
import { unlink } from 'fs/promises';
import { join } from 'path';

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
  }
}


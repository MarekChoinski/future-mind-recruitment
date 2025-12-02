import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);
  async resizeImage(
    inputPath: string,
    outputPath: string,
    width: number,
    height: number,
  ): Promise<void> {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .toFile(outputPath);
  }

  async optimizeForWeb(
    inputPath: string,
    outputPath: string,
  ): Promise<{ width: number; height: number }> {
    const info = await sharp(inputPath)
      .jpeg({ quality: 85, progressive: true })
      .png({ compressionLevel: 9 })
      .webp({ quality: 85 })
      .toFile(outputPath);

    return {
      width: info.width,
      height: info.height,
    };
  }

  async getImageDimensions(
    filePath: string,
  ): Promise<{ width: number; height: number }> {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  }

  async processAndOptimize(
    inputPath: string,
    outputPath: string,
    targetWidth?: number,
    targetHeight?: number,
  ): Promise<{ width: number; height: number }> {
    const startTime = Date.now();

    let processor = sharp(inputPath);

    if (targetWidth && targetHeight) {
      this.logger.debug(
        `Resizing image to ${targetWidth}x${targetHeight} (fit: cover)`,
      );
      processor = processor.resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'center',
      });
    }

    this.logger.debug(`Optimizing image quality and format`);

    const info = await processor
      .jpeg({ quality: 85, progressive: true })
      .png({ compressionLevel: 9 })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const processingTime = Date.now() - startTime;

    this.logger.log(
      `Sharp processing completed: ${info.width}x${info.height}, Format: ${info.format}, Size: ${(info.size / 1024).toFixed(2)}KB, Time: ${processingTime}ms`,
    );

    return {
      width: info.width,
      height: info.height,
    };
  }
}

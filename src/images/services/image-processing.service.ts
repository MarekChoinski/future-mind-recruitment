import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class ImageProcessingService {
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
    let processor = sharp(inputPath);

    if (targetWidth && targetHeight) {
      processor = processor.resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'center',
      });
    }

    const info = await processor
      .jpeg({ quality: 85, progressive: true })
      .png({ compressionLevel: 9 })
      .webp({ quality: 85 })
      .toFile(outputPath);

    return {
      width: info.width,
      height: info.height,
    };
  }
}


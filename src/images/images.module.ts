import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { ImageProcessingService } from './services/image-processing.service';

@Module({
  imports: [],
  controllers: [ImagesController],
  providers: [ImagesService, ImageProcessingService],
})
export class ImagesModule {}

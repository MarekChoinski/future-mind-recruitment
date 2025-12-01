import { Image } from '@prisma/client';
import { ImageResponseDto } from '../dto/image-response.dto';

export function toImageResponseDto(image: Image): ImageResponseDto {
  return {
    id: image.id,
    title: image.title,
    url: image.url,
    width: image.width,
    height: image.height,
  };
}


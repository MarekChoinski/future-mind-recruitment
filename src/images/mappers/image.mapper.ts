import { ImageResponseDto } from '../dto/image-response.dto';

interface Image {
  id: string;
  title: string;
  path: string;
  url: string;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
}

export function toImageResponseDto(image: Image): ImageResponseDto {
  return {
    id: image.id,
    title: image.title,
    url: image.url,
    width: image.width,
    height: image.height,
  };
}


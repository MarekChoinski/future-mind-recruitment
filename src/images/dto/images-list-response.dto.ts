import { ImageResponseDto } from './image-response.dto';

export class ImagesListResponseDto {
  data: ImageResponseDto[];
  meta: {
    count: number;
    page: number;
    limit: number;
    pages: number;
  };
}


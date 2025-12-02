import { ImageResponseDto } from './image-response.dto';
import { ApiProperty } from '@nestjs/swagger';

class MetaDto {
  @ApiProperty({ example: 42 })
  count: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  pages: number;
}

export class ImagesListResponseDto {
  @ApiProperty({ type: [ImageResponseDto] })
  data: ImageResponseDto[];

  @ApiProperty({ type: MetaDto })
  meta: MetaDto;
}


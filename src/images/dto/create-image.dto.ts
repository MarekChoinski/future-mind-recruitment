import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({ example: 'Beautiful landscape' })
  @IsString()
  title: string;

  @ApiProperty({ example: 1920 })
  @IsInt()
  @Min(1)
  width: number;

  @ApiProperty({ example: 1080 })
  @IsInt()
  @Min(1)
  height: number;
}

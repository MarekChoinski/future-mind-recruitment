import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ImagesService {
  constructor(private readonly prisma: PrismaService) {}

  async createImage(
    title: string,
    width: number,
    height: number,
    path: string,
    filename: string,
  ) {
    const url = `/static/${filename}`;

    return this.prisma.image.create({
      data: {
        title,
        width,
        height,
        path,
        url,
      },
    });
  }
}


/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from './images.service';
import { PrismaService } from '../prisma/prisma.service';
import { ImageProcessingService } from './services/image-processing.service';
import { ConfigService } from '@nestjs/config';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

jest.mock('fs/promises', () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(false),
}));

describe('ImagesService', () => {
  let service: ImagesService;
  let prismaService: PrismaService;
  let imageProcessingService: ImageProcessingService;

  const mockImage = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Image',
    path: 'uploads/processed/test.jpg',
    url: 'http://localhost:3000/static/test.jpg',
    width: 1920,
    height: 1080,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: PrismaService,
          useValue: {
            image: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: ImageProcessingService,
          useValue: {
            processAndOptimize: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3000'),
          },
        },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
    prismaService = module.get<PrismaService>(PrismaService);
    imageProcessingService = module.get<ImageProcessingService>(
      ImageProcessingService,
    );
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createImage', () => {
    it('should create image record with given data', async () => {
      const title = 'Test Image';
      const width = 1920;
      const height = 1080;
      const tmpPath = 'uploads/tmp/test.jpg';
      const tmpFilename = 'test.jpg';

      jest
        .spyOn(imageProcessingService, 'processAndOptimize')
        .mockResolvedValue({
          width: 1920,
          height: 1080,
        });

      jest.spyOn(prismaService.image, 'create').mockResolvedValue(mockImage);

      const result = await service.createImage(
        title,
        width,
        height,
        tmpPath,
        tmpFilename,
      );

      expect(imageProcessingService.processAndOptimize).toHaveBeenCalledWith(
        tmpPath,
        expect.stringContaining('uploads/processed/test.jpg'),
        width,
        height,
      );

      expect(prismaService.image.create).toHaveBeenCalledWith({
        data: {
          title,
          width: 1920,
          height: 1080,
          path: expect.stringContaining('uploads/processed/test.jpg'),
          url: 'http://localhost:3000/static/test.jpg',
        },
      });

      expect(result).toEqual(mockImage);
    });

    it('should throw InternalServerErrorException when image processing fails', async () => {
      const title = 'Test Image';
      const width = 1920;
      const height = 1080;
      const tmpPath = 'uploads/tmp/test.jpg';
      const tmpFilename = 'test.jpg';

      jest
        .spyOn(imageProcessingService, 'processAndOptimize')
        .mockRejectedValue(new Error('Processing failed'));

      await expect(
        service.createImage(title, width, height, tmpPath, tmpFilename),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should use actual dimensions from image processing', async () => {
      const title = 'Test Image';
      const requestedWidth = 2000;
      const requestedHeight = 1500;
      const tmpPath = 'uploads/tmp/test.jpg';
      const tmpFilename = 'test.jpg';

      const actualDimensions = { width: 1920, height: 1080 };

      jest
        .spyOn(imageProcessingService, 'processAndOptimize')
        .mockResolvedValue(actualDimensions);
      jest.spyOn(prismaService.image, 'create').mockResolvedValue({
        ...mockImage,
        width: actualDimensions.width,
        height: actualDimensions.height,
      });

      await service.createImage(
        title,
        requestedWidth,
        requestedHeight,
        tmpPath,
        tmpFilename,
      );

      expect(prismaService.image.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          width: actualDimensions.width,
          height: actualDimensions.height,
        }),
      });
    });
  });

  describe('findOne', () => {
    it('should return image when found', async () => {
      jest
        .spyOn(prismaService.image, 'findUnique')
        .mockResolvedValue(mockImage);

      const result = await service.findOne(mockImage.id);

      expect(prismaService.image.findUnique).toHaveBeenCalledWith({
        where: { id: mockImage.id },
      });
      expect(result).toEqual(mockImage);
    });

    it('should throw NotFoundException when image not found', async () => {
      const nonExistentId = 'non-existent-id';
      jest.spyOn(prismaService.image, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        `Image with ID ${nonExistentId} not found`,
      );
    });
  });

  describe('findAll', () => {
    const mockImages = [mockImage];

    it('should return paginated images', async () => {
      jest.spyOn(prismaService.image, 'findMany').mockResolvedValue(mockImages);
      jest.spyOn(prismaService.image, 'count').mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(prismaService.image.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        images: mockImages,
        count: 1,
        page: 1,
        limit: 10,
        pages: 1,
      });
    });

    it('should filter by title', async () => {
      jest.spyOn(prismaService.image, 'findMany').mockResolvedValue(mockImages);
      jest.spyOn(prismaService.image, 'count').mockResolvedValue(1);

      await service.findAll(1, 10, 'test');

      expect(prismaService.image.findMany).toHaveBeenCalledWith({
        where: {
          title: {
            contains: 'test',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should calculate pagination correctly', async () => {
      jest.spyOn(prismaService.image, 'findMany').mockResolvedValue(mockImages);
      jest.spyOn(prismaService.image, 'count').mockResolvedValue(25);

      const result = await service.findAll(2, 10);

      expect(prismaService.image.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.pages).toBe(3);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from './images.service';
import { PrismaService } from '../prisma/prisma.service';
import { ImageProcessingService } from './services/image-processing.service';
import { ConfigService } from '@nestjs/config';

describe('ImagesService', () => {
  let service: ImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: ImageProcessingService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});


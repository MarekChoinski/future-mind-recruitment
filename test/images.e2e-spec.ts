import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

describe('Images API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const testImagePath = join(__dirname, 'fixtures', 'test-image.jpg');
  const mockImages: any[] = [];

  const mockPrismaService = {
    image: {
      create: jest.fn((args) => {
        const image = {
          id: `test-id-${mockImages.length + 1}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockImages.push(image);
        return Promise.resolve(image);
      }),
      findMany: jest.fn((args) => {
        let filtered = [...mockImages];
        
        if (args?.where?.title?.contains) {
          const search = args.where.title.contains.toLowerCase();
          filtered = filtered.filter((img) =>
            img.title.toLowerCase().includes(search),
          );
        }

        const skip = args?.skip || 0;
        const take = args?.take || 10;
        
        return Promise.resolve(filtered.slice(skip, skip + take));
      }),
      findUnique: jest.fn((args) => {
        const image = mockImages.find((img) => img.id === args.where.id);
        return Promise.resolve(image || null);
      }),
      count: jest.fn((args) => {
        let filtered = [...mockImages];
        
        if (args?.where?.title?.contains) {
          const search = args.where.title.contains.toLowerCase();
          filtered = filtered.filter((img) =>
            img.title.toLowerCase().includes(search),
          );
        }
        
        return Promise.resolve(filtered.length);
      }),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeAll(async () => {
    const fixturesDir = join(__dirname, 'fixtures');
    if (!existsSync(fixturesDir)) {
      mkdirSync(fixturesDir, { recursive: true });
    }

    const base64Image = Buffer.from(
      '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
      'base64',
    );
    writeFileSync(testImagePath, base64Image);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockImages.length = 0;
    jest.clearAllMocks();
  });

  describe('POST /images', () => {
    it('should upload and process image', () => {
      return request(app.getHttpServer())
        .post('/images')
        .attach('file', testImagePath)
        .field('title', 'Test Image')
        .field('width', '800')
        .field('height', '600')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('title', 'Test Image');
          expect(res.body).toHaveProperty('url');
          expect(res.body).toHaveProperty('width');
          expect(res.body).toHaveProperty('height');
        });
    });

    it('should reject upload without file', () => {
      return request(app.getHttpServer())
        .post('/images')
        .field('title', 'Test Image')
        .field('width', '800')
        .field('height', '600')
        .expect(400);
    });

    it('should reject upload with invalid width', () => {
      return request(app.getHttpServer())
        .post('/images')
        .attach('file', testImagePath)
        .field('title', 'Test Image')
        .field('width', '-1')
        .field('height', '600')
        .expect(500);
    });
  });

  describe('GET /images', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/images')
        .attach('file', testImagePath)
        .field('title', 'Landscape Photo')
        .field('width', '1920')
        .field('height', '1080');

      await request(app.getHttpServer())
        .post('/images')
        .attach('file', testImagePath)
        .field('title', 'Portrait Photo')
        .field('width', '1080')
        .field('height', '1920');
    });

    it('should return list of images', () => {
      return request(app.getHttpServer())
        .get('/images')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.meta).toHaveProperty('count');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
          expect(res.body.meta).toHaveProperty('pages');
        });
    });

    it('should filter images by title', () => {
      return request(app.getHttpServer())
        .get('/images?title=Landscape')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(1);
          expect(res.body.data[0].title).toContain('Landscape');
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/images?page=1&limit=1')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(1);
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(1);
          expect(res.body.meta.count).toBe(2);
          expect(res.body.meta.pages).toBe(2);
        });
    });

    it('should return second page of results', () => {
      return request(app.getHttpServer())
        .get('/images?page=2&limit=1')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(1);
          expect(res.body.meta.page).toBe(2);
        });
    });

    it('should reject invalid page parameter', () => {
      return request(app.getHttpServer())
        .get('/images?page=0')
        .expect(400);
    });

    it('should reject limit above maximum', () => {
      return request(app.getHttpServer())
        .get('/images?limit=101')
        .expect(400);
    });
  });

  describe('GET /images/:id', () => {
    let imageId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/images')
        .attach('file', testImagePath)
        .field('title', 'Test Image')
        .field('width', '800')
        .field('height', '600');

      imageId = response.body.id;
    });

    it('should return single image by id', () => {
      return request(app.getHttpServer())
        .get(`/images/${imageId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', imageId);
          expect(res.body).toHaveProperty('title', 'Test Image');
          expect(res.body).toHaveProperty('url');
          expect(res.body).toHaveProperty('width');
          expect(res.body).toHaveProperty('height');
        });
    });

    it('should return 404 for non-existent image', () => {
      return request(app.getHttpServer())
        .get('/images/non-existent-id')
        .expect(404);
    });
  });
});


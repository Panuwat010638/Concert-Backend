import { Test, TestingModule } from '@nestjs/testing';
import { ConcertsController } from './concerts.controller';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto } from './dto/create-concert.dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

describe('ConcertsController', () => {
  let controller: ConcertsController;
  let service: ConcertsService;

  const mockConcert = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Concert',
    description: 'Test Description',
    totalSeats: 100,
    reservedSeats: 0,
    status: 'active',
  };

  const mockConcertsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConcertsController],
      providers: [
        {
          provide: ConcertsService,
          useValue: mockConcertsService,
        },
      ],
    }).compile();

    controller = module.get<ConcertsController>(ConcertsController);
    service = module.get<ConcertsService>(ConcertsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a concert successfully', async () => {
      const createConcertDto: CreateConcertDto = {
        name: 'New Concert',
        description: 'Concert Description',
        totalSeats: 100,
      };

      mockConcertsService.create.mockResolvedValue(mockConcert);

      const result = await controller.create(createConcertDto);

      expect(result).toEqual({
        success: true,
        message: 'สร้างคอนเสิร์ตสำเร็จ',
        data: mockConcert,
      });
      expect(mockConcertsService.create).toHaveBeenCalledWith(createConcertDto);
    });

    it('should handle creation errors', async () => {
      const createConcertDto: CreateConcertDto = {
        name: 'New Concert',
        description: 'Concert Description',
        totalSeats: 100,
      };

      mockConcertsService.create.mockRejectedValue(new Error('Database error'));

      await expect(controller.create(createConcertDto)).rejects.toThrow(HttpException);
      await expect(controller.create(createConcertDto)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('findAll', () => {
    it('should return all concerts', async () => {
      const mockConcerts = [mockConcert, { ...mockConcert, _id: '507f1f77bcf86cd799439012' }];
      mockConcertsService.findAll.mockResolvedValue(mockConcerts);

      const result = await controller.findAll();

      expect(result).toEqual({
        success: true,
        count: 2,
        data: mockConcerts,
      });
      expect(mockConcertsService.findAll).toHaveBeenCalled();
    });

    it('should handle findAll errors', async () => {
      mockConcertsService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow(HttpException);
      await expect(controller.findAll()).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('findOne', () => {
    it('should return a concert by id', async () => {
      mockConcertsService.findOne.mockResolvedValue(mockConcert);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual({
        success: true,
        data: mockConcert,
      });
      expect(mockConcertsService.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should handle not found error', async () => {
      mockConcertsService.findOne.mockRejectedValue(
        new NotFoundException('ไม่พบคอนเสิร์ต ID: invalid-id')
      );

      await expect(controller.findOne('invalid-id')).rejects.toThrow(HttpException);
      await expect(controller.findOne('invalid-id')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('remove', () => {
    it('should delete a concert successfully', async () => {
      mockConcertsService.remove.mockResolvedValue({ message: 'ลบคอนเสิร์ต Test Concert สำเร็จ' });

      const result = await controller.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual({
        success: true,
        message: 'ลบคอนเสิร์ตสำเร็จ',
      });
      expect(mockConcertsService.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should handle deletion errors', async () => {
      mockConcertsService.remove.mockRejectedValue(
        new NotFoundException('ไม่พบคอนเสิร์ต ID: invalid-id')
      );

      await expect(controller.remove('invalid-id')).rejects.toThrow(HttpException);
      await expect(controller.remove('invalid-id')).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });
});

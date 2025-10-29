import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConcertsService } from './concerts.service';
import { Concert } from './schemas/concert.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';

describe('ConcertsService', () => {
  let service: ConcertsService;
  let model: Model<Concert>;

  const mockConcert = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Concert',
    description: 'Test Description',
    totalSeats: 100,
    reservedSeats: 0,
    status: 'active',
    save: jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Concert',
      description: 'Test Description',
      totalSeats: 100,
      reservedSeats: 0,
      status: 'active'
    }),
  };

  const mockConcertModel = jest.fn().mockImplementation(() => mockConcert);
  mockConcertModel.find = jest.fn();
  mockConcertModel.findById = jest.fn();
  mockConcertModel.findByIdAndDelete = jest.fn();
  mockConcertModel.findByIdAndUpdate = jest.fn();
  mockConcertModel.create = jest.fn();
  mockConcertModel.exec = jest.fn();
  mockConcertModel.sort = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertsService,
        {
          provide: getModelToken(Concert.name),
          useValue: mockConcertModel,
        },
      ],
    }).compile();

    service = module.get<ConcertsService>(ConcertsService);
    model = module.get<Model<Concert>>(getModelToken(Concert.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new concert', async () => {
      const createConcertDto = {
        name: 'New Concert',
        description: 'Concert Description',
        totalSeats: 100,
      };

      const result = await service.create(createConcertDto);
      expect(result).toBeDefined();
      expect(result.name).toBe('Test Concert');
    });

    it('should throw error if creation fails', async () => {
      const createConcertDto = {
        name: 'New Concert',
        description: 'Concert Description',
        totalSeats: 100,
      };

      // Mock the constructor to throw error
      mockConcertModel.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await expect(service.create(createConcertDto)).rejects.toThrow('ไม่สามารถสร้างคอนเสิร์ตได้: Database error');
    });
  });

  describe('findAll', () => {
    it('should return all concerts', async () => {
      const mockConcerts = [mockConcert, { ...mockConcert, _id: '507f1f77bcf86cd799439012' }];
      
      mockConcertModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockConcerts),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual(mockConcerts);
      expect(mockConcertModel.find).toHaveBeenCalled();
    });

    it('should handle empty result', async () => {
      mockConcertModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a concert by id', async () => {
      mockConcertModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockConcert),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockConcert);
      expect(mockConcertModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if concert not found', async () => {
      mockConcertModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a concert', async () => {
      mockConcertModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockConcert),
      });
      
      mockConcertModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockConcert),
      });

      const result = await service.remove('507f1f77bcf86cd799439011');
      expect(result).toEqual({ message: 'ลบคอนเสิร์ต Test Concert สำเร็จ' });
      expect(mockConcertModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockConcertModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if concert to delete not found', async () => {
      mockConcertModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateReservedSeats', () => {
    it('should increment reserved seats', async () => {
      mockConcertModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockConcert),
      });
      
      const updatedConcert = { ...mockConcert, reservedSeats: 1 };
      mockConcertModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedConcert),
      });

      const result = await service.updateReservedSeats('507f1f77bcf86cd799439011', 1);
      expect(result.reservedSeats).toBe(1);
    });

    it('should decrement reserved seats', async () => {
      const concertWithReserved = { ...mockConcert, reservedSeats: 5 };
      const updatedConcert = { ...mockConcert, reservedSeats: 4 };
      
      mockConcertModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(concertWithReserved),
      });
      
      mockConcertModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedConcert),
      });

      const result = await service.updateReservedSeats('507f1f77bcf86cd799439011', -1);
      expect(result.reservedSeats).toBe(4);
    });

    it('should throw error when trying to reserve full concert', async () => {
      const fullConcert = { ...mockConcert, totalSeats: 100, reservedSeats: 100 };
      
      mockConcertModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(fullConcert),
      });

      await expect(
        service.updateReservedSeats('507f1f77bcf86cd799439011', 1)
      ).rejects.toThrow('ที่นั่งเต็มแล้ว');
    });
  });
});

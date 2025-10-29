import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReservationsService } from './reservations.service';
import { Reservation } from './schemas/reservation.schema';
import { ConcertsService } from '../concerts/concerts.service';
import { ActionLogsService } from '../action-logs/action-logs.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let model: Model<Reservation>;
  let concertsService: ConcertsService;
  let actionLogsService: ActionLogsService;

  const mockReservation = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    concertId: '507f1f77bcf86cd799439012',
    concertName: 'Test Concert',
    status: 'reserved',
    reservedAt: new Date(),
    save: jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      username: 'testuser',
      concertId: '507f1f77bcf86cd799439012',
      concertName: 'Test Concert',
      status: 'reserved',
      reservedAt: new Date(),
    }),
  };

  const mockConcert = {
    _id: '507f1f77bcf86cd799439012',
    name: 'Test Concert',
    description: 'Test Description',
    totalSeats: 100,
    reservedSeats: 50,
    status: 'active',
  };

  const mockReservationModel = jest
    .fn()
    .mockImplementation(() => mockReservation);
  mockReservationModel.find = jest.fn();
  mockReservationModel.findById = jest.fn();
  mockReservationModel.findOne = jest.fn();
  mockReservationModel.create = jest.fn();
  mockReservationModel.exec = jest.fn();
  mockReservationModel.sort = jest.fn();

  const mockConcertsService = {
    findOne: jest.fn(),
    updateReservedSeats: jest.fn(),
  };

  const mockActionLogsService = {
    createLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getModelToken(Reservation.name),
          useValue: mockReservationModel,
        },
        {
          provide: ConcertsService,
          useValue: mockConcertsService,
        },
        {
          provide: ActionLogsService,
          useValue: mockActionLogsService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    model = module.get<Model<Reservation>>(getModelToken(Reservation.name));
    concertsService = module.get<ConcertsService>(ConcertsService);
    actionLogsService = module.get<ActionLogsService>(ActionLogsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation successfully', async () => {
      const createReservationDto = {
        username: 'testuser',
        concertId: '507f1f77bcf86cd799439012',
      };

      const savedReservation = {
        ...mockReservation,
        save: jest.fn().mockResolvedValue(mockReservation),
      };

      // Mock implementations
      mockConcertsService.findOne.mockResolvedValue(mockConcert);

      // Mock findOne to return null directly (no existing reservation)
      mockReservationModel.findOne.mockResolvedValue(null);

      // Mock the constructor and save
      mockReservationModel.mockReturnValueOnce(savedReservation);

      mockConcertsService.updateReservedSeats.mockResolvedValue(mockConcert);
      mockActionLogsService.createLog.mockResolvedValue({});

      const result = await service.create(createReservationDto);

      expect(result).toBeDefined();
      expect(mockConcertsService.findOne).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
      );
      expect(mockConcertsService.updateReservedSeats).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
        1,
      );
    });

    it('should throw BadRequestException if concert is cancelled', async () => {
      const createReservationDto = {
        username: 'testuser',
        concertId: '507f1f77bcf86cd799439012',
      };

      const cancelledConcert = { ...mockConcert, status: 'cancelled' };
      mockConcertsService.findOne.mockResolvedValue(cancelledConcert);

      // Reset findOne mock to return null (no existing reservation)
      mockReservationModel.findOne.mockResolvedValue(null);

      await expect(service.create(createReservationDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockConcertsService.findOne).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
      );
    });

    it('should throw BadRequestException if concert is sold out', async () => {
      const createReservationDto = {
        username: 'testuser',
        concertId: '507f1f77bcf86cd799439012',
      };

      const soldOutConcert = {
        ...mockConcert,
        totalSeats: 100,
        reservedSeats: 100,
      };
      mockConcertsService.findOne.mockResolvedValue(soldOutConcert);

      // Reset findOne mock to return null (no existing reservation)
      mockReservationModel.findOne.mockResolvedValue(null);

      await expect(service.create(createReservationDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user already reserved', async () => {
      const createReservationDto = {
        username: 'testuser',
        concertId: '507f1f77bcf86cd799439012',
      };

      mockConcertsService.findOne.mockResolvedValue(mockConcert);
      // Mock to return an existing reservation
      mockReservationModel.findOne.mockResolvedValue(mockReservation);

      await expect(service.create(createReservationDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all reservations', async () => {
      const mockReservations = [
        mockReservation,
        { ...mockReservation, _id: '507f1f77bcf86cd799439013' },
      ];

      mockReservationModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockReservations),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual(mockReservations);
      expect(mockReservationModel.find).toHaveBeenCalled();
    });
  });

  describe('findByUsername', () => {
    it('should return reservations for a specific user', async () => {
      const mockUserReservations = [mockReservation];

      mockReservationModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUserReservations),
        }),
      });

      const result = await service.findByUsername('testuser');
      expect(result).toEqual(mockUserReservations);
      expect(mockReservationModel.find).toHaveBeenCalledWith({
        username: 'testuser',
      });
    });
  });

  describe('findByConcert', () => {
    it('should return reservations for a specific concert', async () => {
      const mockConcertReservations = [mockReservation];

      mockReservationModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockConcertReservations),
        }),
      });

      const result = await service.findByConcert('507f1f77bcf86cd799439012');
      expect(result).toEqual(mockConcertReservations);
      expect(mockReservationModel.find).toHaveBeenCalledWith({
        concertId: '507f1f77bcf86cd799439012',
        status: 'reserved',
      });
    });
  });

  describe('cancel', () => {
    it('should cancel a reservation successfully', async () => {
      const cancelledReservation = {
        ...mockReservation,
        status: 'cancelled',
        cancelledAt: new Date(),
      };

      mockReservationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockReservation,
          save: jest.fn().mockResolvedValue(cancelledReservation),
        }),
      });
      mockConcertsService.updateReservedSeats.mockResolvedValue(mockConcert);
      mockActionLogsService.createLog.mockResolvedValue({});

      const result = await service.cancel(
        '507f1f77bcf86cd799439011',
        'testuser',
      );

      expect(result).toBeDefined();
      expect(mockConcertsService.updateReservedSeats).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
        -1,
      );
    });

    it('should throw NotFoundException if reservation not found', async () => {
      mockReservationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.cancel('507f1f77bcf86cd799439011', 'testuser'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if username does not match', async () => {
      mockReservationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReservation),
      });

      await expect(
        service.cancel('507f1f77bcf86cd799439011', 'wronguser'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if already cancelled', async () => {
      const cancelledReservation = { ...mockReservation, status: 'cancelled' };

      mockReservationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(cancelledReservation),
      });

      await expect(
        service.cancel('507f1f77bcf86cd799439011', 'testuser'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

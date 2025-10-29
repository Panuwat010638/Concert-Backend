// src/reservations/reservations.service.ts
// Service สำหรับจัดการการจองตั๋ว - แก้ไขให้บันทึก Action Log

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ConcertsService } from '../concerts/concerts.service';
import { ActionLogsService } from '../action-logs/action-logs.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    private concertsService: ConcertsService, // ใช้ service ของ concerts
    private actionLogsService: ActionLogsService, // เพิ่ม action logs service
  ) {}

  // สร้างการจองใหม่
  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    try {
      // 1. ดึงข้อมูลคอนเสิร์ต
      const concert = await this.concertsService.findOne(createReservationDto.concertId);
      
      // 2. เช็คสถานะคอนเสิร์ต
      if (concert.status === 'cancelled') {
        throw new BadRequestException('คอนเสิร์ตถูกยกเลิกแล้ว');
      }
      
      if (concert.status === 'soldout') {
        throw new BadRequestException('ตั๋วหมดแล้ว');
      }
      
      if (concert.reservedSeats >= concert.totalSeats) {
        throw new BadRequestException('ที่นั่งเต็มแล้ว');
      }

      // 3. เช็คว่า user นี้จองคอนเสิร์ตนี้แล้วหรือยัง
      const existingReservation = await this.reservationModel.findOne({
        username: createReservationDto.username,
        concertId: createReservationDto.concertId,
        status: 'reserved',
      });

      if (existingReservation) {
        throw new BadRequestException('คุณได้จองคอนเสิร์ตนี้แล้ว');
      }

      // 4. สร้างการจองใหม่
      const newReservation = new this.reservationModel({
        username: createReservationDto.username,
        concertId: createReservationDto.concertId,
        concertName: concert.name,
        status: 'reserved',
        reservedAt: new Date(),
      });

      const savedReservation = await newReservation.save();

      // 5. อัพเดทจำนวนที่นั่งในคอนเสิร์ต
      // Cast concert เป็น any เพื่อเข้าถึง _id
      const concertWithId = concert as any;
      await this.concertsService.updateReservedSeats(concertWithId._id, 1);

      // 6. บันทึก Action Log สำหรับการจอง
      // Cast savedReservation เป็น any เพื่อเข้าถึง _id
      const savedReservationWithId = savedReservation as any;
      await this.actionLogsService.createLog({
        username: createReservationDto.username,
        action: 'reserve', // action = การจอง
        concertId: createReservationDto.concertId,
        concertName: concert.name,
        reservationId: savedReservationWithId._id.toString(),
        details: `จองตั๋วคอนเสิร์ต ${concert.name}`,
      });

      return savedReservation;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`ไม่สามารถสร้างการจองได้: ${error.message}`);
    }
  }

  // ดึงข้อมูลการจองทั้งหมด
  async findAll(): Promise<Reservation[]> {
    try {
      return await this.reservationModel
        .find()
        .sort({ createdAt: -1 }) // เรียงจากใหม่ไปเก่า
        .exec();
    } catch (error) {
      throw new Error(`ไม่สามารถดึงข้อมูลได้: ${error.message}`);
    }
  }

  // ดึงข้อมูลการจองของ user
  async findByUsername(username: string): Promise<Reservation[]> {
    try {
      return await this.reservationModel
        .find({ username: username })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new Error(`ไม่สามารถดึงข้อมูลได้: ${error.message}`);
    }
  }

  // ดึงข้อมูลการจองของคอนเสิร์ต
  async findByConcert(concertId: string): Promise<Reservation[]> {
    try {
      return await this.reservationModel
        .find({ concertId: concertId, status: 'reserved' })
        .sort({ createdAt: -1 }) // เรียงตามวันที่จองล่าสุดก่อน
        .exec();
    } catch (error) {
      throw new Error(`ไม่สามารถดึงข้อมูลได้: ${error.message}`);
    }
  }

  // ยกเลิกการจอง
  async cancel(reservationId: string, username: string): Promise<{ message: string }> {
    try {
      // 1. หาการจองที่ต้องการยกเลิก
      const reservation = await this.reservationModel.findById(reservationId).exec();
      
      if (!reservation) {
        throw new NotFoundException('ไม่พบการจองนี้');
      }

      // 2. เช็คว่าเป็นการจองของ user นี้หรือไม่
      if (reservation.username !== username) {
        throw new BadRequestException('คุณไม่สามารถยกเลิกการจองของผู้อื่นได้');
      }

      // 3. เช็คว่ายกเลิกแล้วหรือยัง
      if (reservation.status === 'cancelled') {
        throw new BadRequestException('การจองนี้ถูกยกเลิกแล้ว');
      }

      // 4. อัพเดทสถานะเป็น cancelled
      reservation.status = 'cancelled';
      reservation.cancelledAt = new Date();
      await reservation.save();

      // 5. อัพเดทจำนวนที่นั่งในคอนเสิร์ต (ลดที่นั่งที่จองแล้ว)
      await this.concertsService.updateReservedSeats(reservation.concertId.toString(), -1);

      // 6. บันทึก Action Log สำหรับการยกเลิก
      await this.actionLogsService.createLog({
        username: reservation.username,
        action: 'cancel', // action = การยกเลิก
        concertId: reservation.concertId.toString(),
        concertName: reservation.concertName,
        reservationId: reservationId,
        details: `ยกเลิกการจองคอนเสิร์ต ${reservation.concertName}`,
      });

      return { message: `ยกเลิกการจอง ${reservation.concertName} สำเร็จ` };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`ไม่สามารถยกเลิกการจองได้: ${error.message}`);
    }
  }

  // ดึงข้อมูลการจองตาม ID
  async findOne(id: string): Promise<Reservation> {
    try {
      const reservation = await this.reservationModel.findById(id).exec();
      
      if (!reservation) {
        throw new NotFoundException(`ไม่พบการจอง ID: ${id}`);
      }
      
      return reservation;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  }
}

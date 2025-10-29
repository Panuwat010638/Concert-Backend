import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('api/reservations') // กำหนด path หลักเป็น /api/reservations
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // POST /api/reservations - จองตั๋ว
  @Post()
  async create(
    @Body(ValidationPipe) createReservationDto: CreateReservationDto,
  ) {
    try {
      const reservation =
        await this.reservationsService.create(createReservationDto);
      return {
        success: true,
        message: 'จองตั๋วสำเร็จ',
        data: reservation,
      };
    } catch (error) {
      // ถ้าเป็น BadRequest (เช่น ตั๋วหมด, จองซ้ำ)
      if (error.status === 400) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      // ถ้าไม่เจอคอนเสิร์ต
      if (error.status === 404) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      // error อื่นๆ
      throw new HttpException(
        {
          success: false,
          message: error.message || 'ไม่สามารถจองตั๋วได้',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /api/reservations - ดึงการจองทั้งหมด (Admin)
  @Get()
  async findAll() {
    try {
      const reservations = await this.reservationsService.findAll();
      return {
        success: true,
        count: reservations.length,
        data: reservations,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'ไม่สามารถดึงข้อมูลได้',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /api/reservations/user/:username - ดึงการจองของ user
  @Get('user/:username')
  async findByUsername(@Param('username') username: string) {
    try {
      const reservations =
        await this.reservationsService.findByUsername(username);
      return {
        success: true,
        count: reservations.length,
        data: reservations,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'ไม่สามารถดึงข้อมูลได้',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /api/reservations/concert/:concertId - ดึงการจองของคอนเสิร์ต (Admin)
  @Get('concert/:concertId')
  async findByConcert(@Param('concertId') concertId: string) {
    try {
      const reservations =
        await this.reservationsService.findByConcert(concertId);
      return {
        success: true,
        count: reservations.length,
        data: reservations,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'ไม่สามารถดึงข้อมูลได้',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // PATCH /api/reservations/:id/cancel - ยกเลิกการจอง
  @Patch(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Query('username') username: string, // รับ username จาก query parameter
  ) {
    try {
      // เช็คว่าส่ง username มาหรือไม่
      if (!username) {
        throw new HttpException(
          {
            success: false,
            message: 'กรุณาระบุ username',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.reservationsService.cancel(id, username);
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      // ถ้าเป็น BadRequest (เช่น ยกเลิกของคนอื่น, ยกเลิกแล้ว)
      if (error.status === 400) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      // ถ้าไม่เจอการจอง
      if (error.status === 404) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      // error อื่นๆ
      throw new HttpException(
        {
          success: false,
          message: error.message || 'ไม่สามารถยกเลิกการจองได้',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /api/reservations/:id - ดึงการจองตาม ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const reservation = await this.reservationsService.findOne(id);
      return {
        success: true,
        data: reservation,
      };
    } catch (error) {
      // ถ้าไม่เจอให้ส่ง 404
      if (error.status === 404) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      // error อื่นๆ
      throw new HttpException(
        {
          success: false,
          message: error.message || 'เกิดข้อผิดพลาด',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

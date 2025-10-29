// src/concerts/concerts.controller.ts
// Controller สำหรับจัดการ API endpoints ของ Concerts (ลบ Edit/Update ออกแล้ว)

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto } from './dto/create-concert.dto';

@Controller('api/concerts') // กำหนด path หลักเป็น /api/concerts
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  // POST /api/concerts - สร้างคอนเสิร์ตใหม่
  @Post()
  async create(@Body(ValidationPipe) createConcertDto: CreateConcertDto) {
    try {
      const concert = await this.concertsService.create(createConcertDto);
      return {
        success: true,
        message: 'สร้างคอนเสิร์ตสำเร็จ',
        data: concert,
      };
    } catch (error) {
      // ส่ง error กลับไปหา client
      throw new HttpException(
        {
          success: false,
          message: error.message || 'ไม่สามารถสร้างคอนเสิร์ตได้',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GET /api/concerts - ดึงคอนเสิร์ตทั้งหมด
  @Get()
  async findAll() {
    try {
      const concerts = await this.concertsService.findAll();
      return {
        success: true,
        count: concerts.length,
        data: concerts,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'ไม่สามารถดึงข้อมูลได้',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /api/concerts/:id - ดึงคอนเสิร์ตตาม ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const concert = await this.concertsService.findOne(id);
      return {
        success: true,
        data: concert,
      };
    } catch (error) {
      if (error.message.includes('ไม่พบ')) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        {
          success: false,
          message: 'เกิดข้อผิดพลาด',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // DELETE /api/concerts/:id - ลบคอนเสิร์ต
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.concertsService.remove(id);
      return {
        success: true,
        message: 'ลบคอนเสิร์ตสำเร็จ',
      };
    } catch (error) {
      if (error.message.includes('ไม่พบ')) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      if (error.message.includes('ไม่สามารถลบ')) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        {
          success: false,
          message: 'ไม่สามารถลบคอนเสิร์ตได้',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Note: ลบ PATCH endpoint สำหรับ update ออกแล้ว
  // เพราะโจทย์ไม่ต้องการให้มีการแก้ไขคอนเสิร์ต
}

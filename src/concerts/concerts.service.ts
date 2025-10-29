import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Concert, ConcertDocument } from './schemas/concert.schema';
import { CreateConcertDto } from './dto/create-concert.dto';
// ลบ UpdateConcertDto ออกเพราะไม่ใช้แล้ว

@Injectable()
export class ConcertsService {
  constructor(
    @InjectModel(Concert.name) private concertModel: Model<ConcertDocument>,
  ) {}

  // สร้างคอนเสิร์ตใหม่
  async create(createConcertDto: CreateConcertDto): Promise<Concert> {
    try {
      // สร้าง document ใหม่
      const newConcert = new this.concertModel(createConcertDto);
      // บันทึกลงฐานข้อมูล
      return await newConcert.save();
    } catch (error) {
      throw new Error(`ไม่สามารถสร้างคอนเสิร์ตได้: ${error.message}`);
    }
  }

  // ดึงข้อมูลคอนเสิร์ตทั้งหมด
  async findAll(): Promise<Concert[]> {
    try {
      // ดึงทั้งหมดและเรียงตามวันที่สร้างล่าสุด
      return await this.concertModel
        .find()
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new Error(`ไม่สามารถดึงข้อมูลได้: ${error.message}`);
    }
  }

  // ดึงข้อมูลคอนเสิร์ตตาม ID
  async findOne(id: string): Promise<Concert> {
    try {
      const concert = await this.concertModel.findById(id).exec();
      
      // ถ้าไม่เจอให้ throw error
      if (!concert) {
        throw new NotFoundException(`ไม่พบคอนเสิร์ต ID: ${id}`);
      }
      
      return concert;
    } catch (error) {
      // ถ้าเป็น error จาก NotFoundException ให้ส่งต่อ
      if (error instanceof NotFoundException) {
        throw error;
      }
      // error อื่นๆ
      throw new Error(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  }

  // Note: ลบ update method ออกแล้วเพราะโจทย์ไม่ต้องการให้มีการแก้ไขคอนเสิร์ต

  // ลบคอนเสิร์ต
  async remove(id: string): Promise<{ message: string }> {
    try {
      // เช็คว่ามีการจองคอนเสิร์ตนี้หรือไม่ก่อนลบ
      const concert = await this.concertModel.findById(id).exec();
      
      if (!concert) {
        throw new NotFoundException(`ไม่พบคอนเสิร์ต ID: ${id}`);
      }

      // ถ้ามีคนจองแล้ว ไม่ให้ลบ
      if (concert.reservedSeats > 0) {
        throw new Error(`ไม่สามารถลบคอนเสิร์ตได้ เนื่องจากมีการจองแล้ว ${concert.reservedSeats} ที่นั่ง`);
      }

      // ลบคอนเสิร์ต
      await this.concertModel.findByIdAndDelete(id).exec();

      return { message: `ลบคอนเสิร์ต ${concert.name} สำเร็จ` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`ไม่สามารถลบได้: ${error.message}`);
    }
  }

  // อัพเดทจำนวนที่นั่งที่จองแล้ว (ใช้ภายใน service อื่น)
  async updateReservedSeats(id: string, seats: number): Promise<Concert> {
    try {
      // ดึงข้อมูลคอนเสิร์ตปัจจุบัน
      const concert = await this.concertModel.findById(id).exec();
      
      if (!concert) {
        throw new NotFoundException(`ไม่พบคอนเสิร์ต ID: ${id}`);
      }
      
      // เช็คว่าที่นั่งเต็มหรือยัง
      const newReservedSeats = concert.reservedSeats + seats;
      
      if (newReservedSeats > concert.totalSeats) {
        throw new Error('ที่นั่งเต็มแล้ว');
      }
      
      if (newReservedSeats < 0) {
        throw new Error('จำนวนที่นั่งที่จองไม่สามารถติดลบได้');
      }

      // อัพเดทข้อมูล
      const updateData: any = {
        reservedSeats: newReservedSeats
      };
      
      // ถ้าเต็มให้เปลี่ยนสถานะ
      if (newReservedSeats >= concert.totalSeats) {
        updateData.status = 'soldout';
      } else if (concert.status === 'soldout' && newReservedSeats < concert.totalSeats) {
        updateData.status = 'active';
      }

      // อัพเดทและส่งกลับ
      const updatedConcert = await this.concertModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();
        
      if (!updatedConcert) {
        throw new NotFoundException(`ไม่สามารถอัพเดทคอนเสิร์ต ID: ${id}`);
      }
      
      return updatedConcert;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`ไม่สามารถอัพเดทที่นั่งได้: ${error.message}`);
    }
  }
}

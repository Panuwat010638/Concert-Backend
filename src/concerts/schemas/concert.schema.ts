import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// กำหนด type สำหรับ Concert Document
export type ConcertDocument = Concert & Document;

@Schema({ timestamps: true }) // เพิ่ม createdAt, updatedAt อัตโนมัติ
export class Concert {
  @Prop({ required: true }) // ชื่อคอนเสิร์ต (บังคับกรอก)
  name: string;

  @Prop({ required: true }) // รายละเอียดคอนเสิร์ต (บังคับกรอก)
  description: string;

  @Prop({ required: true, min: 1 }) // จำนวนที่นั่งทั้งหมด (ต้องมากกว่า 0)
  totalSeats: number;

  @Prop({ default: 0 }) // จำนวนที่นั่งที่จองแล้ว (เริ่มต้นเป็น 0)
  reservedSeats: number;

  @Prop({ default: 'active' }) // สถานะคอนเสิร์ต (active, cancelled, soldout)
  status: string;
}

// สร้าง Schema สำหรับ MongoDB
export const ConcertSchema = SchemaFactory.createForClass(Concert);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// กำหนด type สำหรับ Reservation Document
export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true }) // เพิ่ม createdAt, updatedAt อัตโนมัติ
export class Reservation {
  @Prop({ required: true }) // ชื่อผู้จอง (บังคับกรอก)
  username: string;

  @Prop({ type: Types.ObjectId, ref: 'Concert', required: true }) // ID ของคอนเสิร์ตที่จอง
  concertId: Types.ObjectId;

  @Prop({ required: true }) // ชื่อคอนเสิร์ต (เก็บไว้เพื่อแสดงผล)
  concertName: string;

  @Prop({ default: 'reserved' }) // สถานะการจอง (reserved = จองแล้ว, cancelled = ยกเลิก)
  status: string;

  @Prop({ default: Date.now }) // วันเวลาที่จอง
  reservedAt: Date;

  @Prop() // วันเวลาที่ยกเลิก (ถ้ามี)
  cancelledAt?: Date;
}

// สร้าง Schema สำหรับ MongoDB
export const ReservationSchema = SchemaFactory.createForClass(Reservation);

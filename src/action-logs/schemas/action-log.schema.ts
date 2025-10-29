// src/action-logs/schemas/action-log.schema.ts
// Schema สำหรับเก็บประวัติการกระทำทั้งหมดของระบบ

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// กำหนด type สำหรับ ActionLog Document
export type ActionLogDocument = ActionLog & Document;

@Schema({ timestamps: true }) // เพิ่ม createdAt, updatedAt อัตโนมัติ
export class ActionLog {
  @Prop({ required: true }) // ชื่อผู้ใช้ที่ทำรายการ
  username: string;

  @Prop({ required: true }) // ประเภทการกระทำ (reserve, cancel)
  action: string;

  @Prop({ type: Types.ObjectId, ref: 'Concert', required: true }) // ID ของคอนเสิร์ต
  concertId: Types.ObjectId;

  @Prop({ required: true }) // ชื่อคอนเสิร์ต (เก็บไว้เพื่อแสดงผล)
  concertName: string;

  @Prop({ type: Types.ObjectId, ref: 'Reservation' }) // ID ของการจอง (ถ้ามี)
  reservationId?: Types.ObjectId;

  @Prop({ default: Date.now }) // วันเวลาที่ทำรายการ
  actionDate: Date;

  @Prop() // รายละเอียดเพิ่มเติม
  details?: string;
}

// สร้าง Schema สำหรับ MongoDB
export const ActionLogSchema = SchemaFactory.createForClass(ActionLog);

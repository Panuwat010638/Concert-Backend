// src/action-logs/action-logs.service.ts
// Service สำหรับจัดการ Action Logs

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActionLog, ActionLogDocument } from './schemas/action-log.schema';

@Injectable()
export class ActionLogsService {
  constructor(
    @InjectModel(ActionLog.name)
    private actionLogModel: Model<ActionLogDocument>,
  ) {}

  // ฟังก์ชันสร้าง Action Log ใหม่
  async createLog(logData: {
    username: string;
    action: string;
    concertId: string;
    concertName: string;
    reservationId?: string;
    details?: string;
  }): Promise<ActionLog> {
    // สร้าง document ใหม่
    const newLog = new this.actionLogModel(logData);

    // บันทึกลงฐานข้อมูล
    return await newLog.save();
  }

  // ฟังก์ชันดึง Action Logs ทั้งหมด
  async getAllLogs(): Promise<ActionLog[]> {
    // ดึงข้อมูลทั้งหมด เรียงตามวันเวลาล่าสุดก่อน
    return await this.actionLogModel
      .find()
      .sort({ actionDate: -1 }) // -1 = เรียงจากมากไปน้อย (ล่าสุดก่อน)
      .exec();
  }

  // ฟังก์ชันดึง Logs ตาม username
  async getLogsByUsername(username: string): Promise<ActionLog[]> {
    // ดึงเฉพาะของ user นี้
    return await this.actionLogModel
      .find({ username })
      .sort({ actionDate: -1 })
      .exec();
  }

  // ฟังก์ชันดึง Logs ตาม concert
  async getLogsByConcert(concertId: string): Promise<ActionLog[]> {
    // ดึงเฉพาะของคอนเสิร์ตนี้
    return await this.actionLogModel
      .find({ concertId })
      .sort({ actionDate: -1 })
      .exec();
  }

  // ฟังก์ชันดึง Logs ตามช่วงเวลา
  async getLogsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<ActionLog[]> {
    // ดึงข้อมูลในช่วงเวลาที่กำหนด
    return await this.actionLogModel
      .find({
        actionDate: {
          $gte: startDate, // มากกว่าหรือเท่ากับ startDate
          $lte: endDate, // น้อยกว่าหรือเท่ากับ endDate
        },
      })
      .sort({ actionDate: -1 })
      .exec();
  }
}

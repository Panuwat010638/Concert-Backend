// src/action-logs/action-logs.controller.ts
// Controller สำหรับจัดการ API endpoints ของ Action Logs

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ActionLogsService } from './action-logs.service';

@Controller('api/action-logs')
export class ActionLogsController {
  constructor(private readonly actionLogsService: ActionLogsService) {}

  // GET /api/action-logs - ดึง logs ทั้งหมด
  @Get()
  async getAllLogs() {
    try {
      // เรียกใช้ service เพื่อดึงข้อมูล
      const logs = await this.actionLogsService.getAllLogs();
      
      // ส่งกลับพร้อม success status
      return {
        success: true,
        count: logs.length,
        data: logs,
      };
    } catch (error) {
      // ถ้าเกิด error ส่งกลับ error message
      return {
        success: false,
        message: 'Failed to fetch action logs',
      };
    }
  }

  // GET /api/action-logs/user/:username - ดึง logs ของ user
  @Get('user/:username')
  async getLogsByUsername(@Param('username') username: string) {
    try {
      // ดึง logs ของ user ที่ระบุ
      const logs = await this.actionLogsService.getLogsByUsername(username);
      
      return {
        success: true,
        count: logs.length,
        data: logs,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch user logs',
      };
    }
  }

  // GET /api/action-logs/concert/:concertId - ดึง logs ของคอนเสิร์ต
  @Get('concert/:concertId')
  async getLogsByConcert(@Param('concertId') concertId: string) {
    try {
      // ดึง logs ของคอนเสิร์ตที่ระบุ
      const logs = await this.actionLogsService.getLogsByConcert(concertId);
      
      return {
        success: true,
        count: logs.length,
        data: logs,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch concert logs',
      };
    }
  }

  // GET /api/action-logs/date-range - ดึง logs ตามช่วงเวลา
  @Get('date-range')
  async getLogsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      // แปลง string เป็น Date object
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // ดึง logs ในช่วงเวลา
      const logs = await this.actionLogsService.getLogsByDateRange(start, end);
      
      return {
        success: true,
        count: logs.length,
        data: logs,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch logs by date range',
      };
    }
  }
}

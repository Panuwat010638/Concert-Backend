// src/action-logs/action-logs.module.ts
// Module สำหรับรวม Action Logs components ทั้งหมด

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActionLogsController } from './action-logs.controller';
import { ActionLogsService } from './action-logs.service';
import { ActionLog, ActionLogSchema } from './schemas/action-log.schema';

@Module({
  imports: [
    // ลงทะเบียน Schema กับ MongoDB
    MongooseModule.forFeature([
      { name: ActionLog.name, schema: ActionLogSchema },
    ]),
  ],
  controllers: [ActionLogsController], // ลงทะเบียน Controller
  providers: [ActionLogsService], // ลงทะเบียน Service
  exports: [ActionLogsService], // Export service เพื่อให้ module อื่นใช้ได้
})
export class ActionLogsModule {}

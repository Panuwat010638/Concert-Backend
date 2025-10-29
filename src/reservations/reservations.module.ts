import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';
import { ConcertsModule } from '../concerts/concerts.module';
import { ActionLogsModule } from '../action-logs/action-logs.module';

@Module({
  imports: [
    // ลงทะเบียน Schema กับ MongoDB
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema }
    ]),
    // import ConcertsModule เพื่อใช้ ConcertsService
    ConcertsModule,
    // import ActionLogsModule เพื่อใช้ ActionLogsService
    ActionLogsModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}

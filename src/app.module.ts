import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConcertsModule } from './concerts/concerts.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ActionLogsModule } from './action-logs/action-logs.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // เชื่อมต่อ MongoDB 
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb+srv://panuwatkrit001:VCNc7HUBG5rC299y@datawow.yp2cwsc.mongodb.net/concert-db?retryWrites=true&w=majority&appName=datawow'
    ),
    // Import modules
    ConcertsModule,
    ReservationsModule,
    ActionLogsModule, // เพิ่ม Action Logs Module
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

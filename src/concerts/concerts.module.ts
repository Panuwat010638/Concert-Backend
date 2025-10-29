import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConcertsController } from './concerts.controller';
import { ConcertsService } from './concerts.service';
import { Concert, ConcertSchema } from './schemas/concert.schema';

@Module({
  imports: [
    // ลงทะเบียน Schema กับ MongoDB
    MongooseModule.forFeature([
      { name: Concert.name, schema: ConcertSchema }
    ]),
  ],
  controllers: [ConcertsController],
  providers: [ConcertsService],
  exports: [ConcertsService], // export เพื่อให้ module อื่นใช้ได้
})
export class ConcertsModule {}

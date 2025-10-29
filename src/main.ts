import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS สำหรับให้ Frontend เรียกใช้ได้
  app.enableCors({
    origin: 'http://localhost:3000', // URL ของ Frontend (Next.js)
    credentials: true,
  });

  // Enable validation pipe สำหรับตรวจสอบข้อมูล
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ลบ field ที่ไม่ได้กำหนดใน DTO
      transform: true, // แปลงข้อมูลให้ตรงกับ type ใน DTO
      forbidNonWhitelisted: true, // ถ้าส่ง field ที่ไม่มีใน DTO มาจะ error
    }),
  );
 
  // รัน Backend ที่ port 3001
  await app.listen(3001);
  console.log('🚀 Backend is running on: http://localhost:3001');
  console.log('📦 API Endpoints:');
  console.log('   - GET    /api/concerts');
  console.log('   - POST   /api/concerts');
  console.log('   - GET    /api/concerts/:id');
  console.log('   - PATCH  /api/concerts/:id');
  console.log('   - DELETE /api/concerts/:id');
  console.log('   - GET    /api/reservations');
  console.log('   - POST   /api/reservations');
  console.log('   - GET    /api/reservations/user/:username');
  console.log('   - GET    /api/reservations/concert/:concertId');
  console.log('   - PATCH  /api/reservations/:id/cancel');
}
bootstrap();

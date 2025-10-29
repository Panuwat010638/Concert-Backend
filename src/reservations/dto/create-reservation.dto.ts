import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

// DTO สำหรับสร้างการจองใหม่
export class CreateReservationDto {
  @IsString() // ต้องเป็น string
  @IsNotEmpty() // ห้ามว่าง
  username: string; // ชื่อผู้จอง

  @IsMongoId() // ต้องเป็น MongoDB ObjectId
  @IsNotEmpty() // ห้ามว่าง
  concertId: string; // ID ของคอนเสิร์ตที่จะจอง
}

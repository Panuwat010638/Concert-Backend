import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

// DTO สำหรับสร้างคอนเสิร์ตใหม่
export class CreateConcertDto {
  @IsString() // ต้องเป็น string
  @IsNotEmpty() // ห้ามว่าง
  name: string; // ชื่อคอนเสิร์ต

  @IsString() // ต้องเป็น string
  @IsNotEmpty() // ห้ามว่าง
  description: string; // รายละเอียด

  @IsNumber() // ต้องเป็นตัวเลข
  @Min(1) // อย่างน้อย 1 ที่นั่ง
  totalSeats: number; // จำนวนที่นั่งทั้งหมด
}
